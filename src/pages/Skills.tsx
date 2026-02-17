import { useApp } from '../AppContext';

const Skills = () => {
  const { state } = useApp();

  return (
    <div className="max-w-6xl mx-auto md:ml-64">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Skills Catalog ⭐</h1>
        <p className="text-gray-600">Browse available clinical skills and requirements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.skills.map(skill => (
          <div key={skill.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">{skill.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                skill.category === 'Basic' ? 'bg-green-100 text-green-800' :
                skill.category === 'Skills' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {skill.category}
              </span>
            </div>
            <p className="text-sm text-gray-600">{skill.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skills;
