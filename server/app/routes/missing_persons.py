from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models import MissingPerson, Photo, Relative, User
from app.utils.image_handler import save_image, delete_image
import json

missing_persons_bp = Blueprint('missing_persons', __name__)


@missing_persons_bp.route('/missing-persons', methods=['POST'])
def create_missing_person():
    """Create a new missing person entry"""
    # user_id = get_jwt_identity()
    
    # Get form data
    data = request.form.to_dict()
    print(f"Received data: {data}")  # Debug print
    
    # Validate required fields
    if not data.get('full_name'):
        return jsonify({'error': 'Full name is required'}), 400
    
    # --- DUPLICATE CHECK LOGIC START ---
    # 1. Filter by Name and Age (Using Age as DOB proxy since DOB is not in model)
    potential_duplicates = MissingPerson.query.filter_by(
        full_name=data['full_name'],
        age=int(data['age']) if data.get('age') else None
    ).all()

    # 2. If potential matches exist, cross-reference with Relatives
    if potential_duplicates:
        relatives_data = request.form.get('relatives')
        if relatives_data:
            try:
                new_relatives = json.loads(relatives_data)
                
                for person in potential_duplicates:
                    # Check existing relatives for this candidate
                    existing_relatives = person.relatives
                    
                    for new_rel in new_relatives:
                        new_rel_name = new_rel.get('name', '').strip().lower()
                        new_rel_relation = new_rel.get('relationship', '').strip().lower()
                        
                        for exist_rel in existing_relatives:
                            exist_rel_name = exist_rel.name.strip().lower()
                            exist_rel_relation = (exist_rel.relationship or '').strip().lower()
                            
                            # CRITERIA: If Relative Name AND Relationship match, consider it a duplicate
                            if new_rel_name == exist_rel_name and new_rel_relation == exist_rel_relation:
                                return jsonify({
                                    'message': 'Person already added. Detected duplicate entry.',
                                    'existing_id': person.id
                                }), 409  # 409 Conflict status
            except json.JSONDecodeError:
                print("Error decoding relatives JSON for duplicate check")
    # --- DUPLICATE CHECK LOGIC END ---

    # Create missing person
    missing_person = MissingPerson(
        full_name=data['full_name'],
        age=int(data['age']) if data.get('age') else None,
        gender=data.get('gender'),
        height=data.get('height'),
        weight=data.get('weight'),
        hair_color=data.get('hair_color'),
        eye_color=data.get('eye_color'),
        last_seen_location=data.get('last_seen_location'),
        last_seen_date=datetime.fromisoformat(data['last_seen_date']) if data.get('last_seen_date') else None,
        description=data.get('description'),
        reporter_id=1
    )
    
    try:
        db.session.add(missing_person)
        db.session.flush()  # Get the ID
        
        # Handle photo uploads (With Debugging added from previous request)
        files = request.files.getlist('photos')
        if not files:
             print("No files received under key 'photos'")

        for file in files:
            if file.filename == '':
                continue
                
            filename, filepath = save_image(file)
            if filename:
                photo = Photo(
                    filename=filename,
                    filepath=filepath,
                    missing_person_id=missing_person.id
                )
                db.session.add(photo)
            else:
                print(f"File {file.filename} skipped (invalid extension or save error)")
        
        # Handle relatives data
        relatives_data = request.form.get('relatives')
        if relatives_data:
            # Note: json is now imported at the top
            relatives_list = json.loads(relatives_data)
            for rel_data in relatives_list:
                if rel_data.get('name'):
                    relative = Relative(
                        name=rel_data['name'],
                        relationship=rel_data.get('relationship'),
                        phone=rel_data.get('phone'),
                        email=rel_data.get('email'),
                        address=rel_data.get('address'),
                        missing_person_id=missing_person.id
                    )
                    db.session.add(relative)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Missing person added successfully',
            'data': missing_person.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@missing_persons_bp.route('/missing-persons', methods=['GET'])
def get_missing_persons():
    """Get all missing persons with optional filters"""
    # Get query parameters
    status = request.args.get('status', 'missing')
    search = request.args.get('search', '')
    gender = request.args.get('gender')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    
    # Build query
    query = MissingPerson.query
    
    if status:
        query = query.filter_by(status=status)
    
    if search:
        query = query.filter(
            db.or_(
                MissingPerson.full_name.ilike(f'%{search}%'),
                MissingPerson.last_seen_location.ilike(f'%{search}%'),
                MissingPerson.description.ilike(f'%{search}%')
            )
        )
    
    if gender:
        query = query.filter_by(gender=gender)
    
    # Order by most recent
    query = query.order_by(MissingPerson.created_at.desc())
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'data': [mp.to_dict() for mp in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@missing_persons_bp.route('/missing-persons/<int:id>', methods=['GET'])
def get_missing_person(id):
    """Get a specific missing person"""
    missing_person = MissingPerson.query.get(id)
    
    if not missing_person:
        return jsonify({'error': 'Missing person not found'}), 404
    
    return jsonify(missing_person.to_dict()), 200


@missing_persons_bp.route('/missing-persons/<int:id>', methods=['PUT'])
@jwt_required()
def update_missing_person(id):
    """Update a missing person entry"""
    user_id = get_jwt_identity()
    missing_person = MissingPerson.query.get(id)
    
    if not missing_person:
        return jsonify({'error': 'Missing person not found'}), 404
    
    # Check if user is the reporter
    if missing_person.reporter_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Update fields
    if 'full_name' in data:
        missing_person.full_name = data['full_name']
    if 'age' in data:
        missing_person.age = data['age']
    if 'gender' in data:
        missing_person.gender = data['gender']
    if 'height' in data:
        missing_person.height = data['height']
    if 'weight' in data:
        missing_person.weight = data['weight']
    if 'hair_color' in data:
        missing_person.hair_color = data['hair_color']
    if 'eye_color' in data:
        missing_person.eye_color = data['eye_color']
    if 'last_seen_location' in data:
        missing_person.last_seen_location = data['last_seen_location']
    if 'last_seen_date' in data:
        missing_person.last_seen_date = datetime.fromisoformat(data['last_seen_date'])
    if 'description' in data:
        missing_person.description = data['description']
    if 'status' in data:
        missing_person.status = data['status']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Missing person updated successfully',
            'data': missing_person.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@missing_persons_bp.route('/missing-persons/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_missing_person(id):
    """Delete a missing person entry"""
    user_id = get_jwt_identity()
    missing_person = MissingPerson.query.get(id)
    
    if not missing_person:
        return jsonify({'error': 'Missing person not found'}), 404
    
    # Check if user is the reporter
    if missing_person.reporter_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        # Delete associated photos
        for photo in missing_person.photos:
            delete_image(photo.filename)
        
        db.session.delete(missing_person)
        db.session.commit()
        
        return jsonify({'message': 'Missing person deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@missing_persons_bp.route('/uploads/<filename>')
def serve_upload(filename):
    """Serve uploaded images"""
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)