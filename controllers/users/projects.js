const Employee = require('../../models/employees');
const Projects = require('../../models/projects');

class ProjectsControllers {
  async all(req, res) {
    const data = await Projects.find({});
    res.json({
      status: 200,
      data: data,
    });
  }
  async detail(req, res) {
    const data = await Projects.findById(req.params.id);
    res.json({
      status: 200,
      data: data,
    });
  }
  async members(req, res) {
    const data = await Projects.findOne({ _id: req.params.id }, { members: 1 });
    console.log('member ', data);
    const members = await Employee.find(
      { _id: { $in: data.members } },
      { name: 1, email: 1, role: 1 }
    );
    res.json({
      status: 200,
      data: members,
    });
  }
}
module.exports = ProjectsControllers;
