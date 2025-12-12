// --- START OF FILE FreelancerSkill1.jsx ---

export default function FreelancerSkill1({ freelancer }) {
  // 1. Handle loading or missing data
  if (!freelancer) return null;

  // 2. Extract skills
  // Try 'skills_list' (array) first, fallback to 'skills' (string)
  let skillsArray = [];

  if (freelancer.skills_list && Array.isArray(freelancer.skills_list) && freelancer.skills_list.length > 0) {
    skillsArray = freelancer.skills_list;
  } else if (freelancer.skills && typeof freelancer.skills === 'string') {
    skillsArray = freelancer.skills.split(',').map(s => s.trim());
  }

  // 3. Clean up the list
  // Remove empty strings and specific placeholders like 'skill1', 'skill2', etc.
  skillsArray = skillsArray.filter(skill => {
    const s = skill ? skill.toLowerCase() : '';
    return s !== '' && s !== 'skill1' && s !== 'skill2' && s !== 'skill3';
  });

  return (
    <>
      <div className="sidebar-widget mb30 pb20 bdrs8">
        <h4 className="widget-title">My Skills</h4>
        <div className="tag-list mt30">
          {skillsArray.length > 0 ? (
            skillsArray.map((skill, index) => (
              <a key={index} href="#">{skill}</a>
            ))
          ) : (
            <span>No specific skills listed.</span>
          )}
        </div>
      </div>
    </>
  );
}