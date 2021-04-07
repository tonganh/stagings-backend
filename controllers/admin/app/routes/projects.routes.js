/* eslint-disable global-require */
const router = new require('express').Router();
const ProjectController = require('../controllers/projects.controller');
const Projects = new ProjectController();
router.get('/', Projects.getAllProject.bind(Projects));
router.post('/', Projects.searchHaveCondition.bind(Projects));
router.post('/create', Projects.createProject.bind(Projects));
router.patch('/update/:id', Projects.updateProject.bind(Projects));
router.delete('/delete/', Projects.deleteProject.bind(Projects));
module.exports = router;
