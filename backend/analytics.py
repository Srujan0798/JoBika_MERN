import sqlite3
from datetime import datetime, timedelta
import json
from collections import Counter

def get_db_connection():
    conn = sqlite3.connect('jobika.db')
    conn.row_factory = sqlite3.Row
    return conn

def get_application_stats(user_id):
    """Get application statistics for a user"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total applications
    cursor.execute('SELECT COUNT(*) FROM applications WHERE user_id = ?', (user_id,))
    total_applications = cursor.fetchone()[0]
    
    # Applications by status
    cursor.execute('''
        SELECT status, COUNT(*) as count 
        FROM applications 
        WHERE user_id = ? 
        GROUP BY status
    ''', (user_id,))
    status_breakdown = {row['status']: row['count'] for row in cursor.fetchall()}
    
    # Applications over time (last 7 days)
    dates = []
    counts = []
    for i in range(6, -1, -1):
        date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        cursor.execute('''
            SELECT COUNT(*) 
            FROM applications 
            WHERE user_id = ? AND date(applied_at) = ?
        ''', (user_id, date))
        count = cursor.fetchone()[0]
        dates.append(date)
        counts.append(count)
        
    conn.close()
    
    return {
        'total': total_applications,
        'breakdown': status_breakdown,
        'timeline': {
            'dates': dates,
            'counts': counts
        }
    }

def get_market_insights():
    """Get general market insights from job listings"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Top skills in demand (simple keyword counting from skills column)
    cursor.execute('SELECT skills FROM jobs')
    all_skills = []
    for row in cursor.fetchall():
        try:
            skills = json.loads(row['skills'])
            all_skills.extend(skills)
        except:
            pass
            
    skill_counts = Counter(all_skills).most_common(5)
    
    # Average salary (parsing simple ranges)
    # This is a placeholder for more complex parsing
    
    conn.close()
    
    return {
        'top_skills': [{'name': s[0], 'count': s[1]} for s in skill_counts]
    }
