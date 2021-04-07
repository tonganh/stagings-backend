const { Seeder } = require('mongoose-data-seed');
const Projects = require('../models/projects');
const { removeVietnameseTones } = require('../utils/functionReuse');

const data = [
  {
    name: 'IB Pharse 1',
  },
  {
    name: 'IB Pharse 2',
  },
  {
    name: 'SCF',
  },
  {
    name: 'LMS',
  },
];

class ProjectsSeeder extends Seeder {
  async shouldRun() {
    const listProjects = await Projects.find({});
    await Promise.all(
      listProjects.map(async (project) => {
        // Convert name to unsigned char
        const slug = removeVietnameseTones(project.name);
        console.log('name convert', slug);
        // update action
        await Projects.findOneAndUpdate(
          { _id: project._id },
          { slug },
          { new: true }
        );
      })
    );
    return Projects.countDocuments()
      .exec()
      .then((count) => count === 0);
  }

  async run() {
    return Projects.create(data);
  }
}

module.exports = ProjectsSeeder;
