import os
from app import create_app, db
from app.models import User, MissingPerson, Photo, Relative

app = create_app(os.getenv('FLASK_ENV', 'development'))


@app.shell_context_processor
def make_shell_context():
    """Make database models available in shell"""
    return {
        'db': db,
        'User': User,
        'MissingPerson': MissingPerson,
        'Photo': Photo,
        'Relative': Relative
    }


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)