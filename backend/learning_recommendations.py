def get_learning_resources(skill):
    """Return free learning resources for a specific skill"""
    
    resources = {
        'python': [
            {'title': 'Python for Everybody (Coursera)', 'url': 'https://www.coursera.org/specializations/python', 'type': 'Course'},
            {'title': 'Real Python', 'url': 'https://realpython.com/', 'type': 'Tutorials'},
            {'title': 'Official Python Docs', 'url': 'https://docs.python.org/3/', 'type': 'Documentation'}
        ],
        'javascript': [
            {'title': 'JavaScript Algorithms (freeCodeCamp)', 'url': 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', 'type': 'Course'},
            {'title': 'MDN Web Docs', 'url': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'type': 'Documentation'},
            {'title': 'JavaScript.info', 'url': 'https://javascript.info/', 'type': 'Tutorials'}
        ],
        'react': [
            {'title': 'React Official Tutorial', 'url': 'https://react.dev/learn', 'type': 'Tutorials'},
            {'title': 'Full Modern React Tutorial (YouTube)', 'url': 'https://www.youtube.com/watch?v=4UZrsTqkcW4', 'type': 'Video'}
        ],
        'sql': [
            {'title': 'SQLZoo', 'url': 'https://sqlzoo.net/', 'type': 'Interactive'},
            {'title': 'Mode SQL Tutorial', 'url': 'https://mode.com/sql-tutorial/', 'type': 'Tutorials'}
        ],
        'machine learning': [
            {'title': 'Machine Learning by Andrew Ng', 'url': 'https://www.coursera.org/specializations/machine-learning-introduction', 'type': 'Course'},
            {'title': 'Fast.ai', 'url': 'https://www.fast.ai/', 'type': 'Course'}
        ],
        'aws': [
            {'title': 'AWS Free Tier', 'url': 'https://aws.amazon.com/free/', 'type': 'Practice'},
            {'title': 'AWS Fundamentals', 'url': 'https://aws.amazon.com/getting-started/fundamentals-core-concepts/', 'type': 'Documentation'}
        ]
    }
    
    # Normalize skill name
    skill_lower = skill.lower()
    
    # Direct match
    if skill_lower in resources:
        return resources[skill_lower]
        
    # Partial match
    for key in resources:
        if key in skill_lower or skill_lower in key:
            return resources[key]
            
    # Default generic resource
    return [
        {'title': f'Learn {skill} on YouTube', 'url': f'https://www.youtube.com/results?search_query=learn+{skill}', 'type': 'Video'},
        {'title': f'{skill} Documentation', 'url': f'https://www.google.com/search?q={skill}+documentation', 'type': 'Search'}
    ]

def get_recommendations_for_gaps(missing_skills):
    """Get resources for a list of missing skills"""
    recommendations = []
    for skill in missing_skills:
        recs = get_learning_resources(skill)
        recommendations.append({
            'skill': skill,
            'resources': recs
        })
    return recommendations
