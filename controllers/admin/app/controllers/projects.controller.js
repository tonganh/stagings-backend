/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable linebreak-style */
const { ObjectID } = require('mongodb');
const Projects = require('../../../../models/projects');
const { ERROR } = require('../../../../utils/error.helper');
const moment = require('moment');
const Onsites = require('../../../../models/onsite');
const Ots = require('../../../../models/ots');
const {
  removeVietnameseTones,
  querySplitPagination,
  datasatisfying,
} = require('../../../../utils/functionReuse');
const ProjectsQuery = require('../query/projects.query');

class ProjectController {
  constructor() {
    this.query = new ProjectsQuery();
  }
  async getAllProject(req, res) {
    try {
      // get pageSize pageNo by req.query.
      const { pageSize = 10, pageNo = 1 } = req.query;
      const query = this.query;
      let getAllProjectsDocuments = query.queryGetAllProjects('', '');
      // total data
      const total = await Projects.find({}).count();
      const queryGetDataAndSplitPage = getAllProjectsDocuments.concat(
        querySplitPagination(pageNo, pageSize)
      );
      // Data respone have page pagination
      const dataResponse = await Projects.aggregate(queryGetDataAndSplitPage);
      return res.json({
        status: ERROR.NO_ERROR,
        data: dataResponse,
        total,
      });
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Some trouble',
      });
    }
  }
  async createProject(req, res) {
    try {
      // Get array ObjectId of member in new project.
      // Convert _id of members in req. to objectID.
      const { name = '' } = req.body;
      const members =
        req.body.members.length > 0
          ? req.body.members.map((value) => ObjectID(value))
          : '';
      req.body.start = moment(req.body.start);
      req.body.end = moment(req.body.end);
      const slug = removeVietnameseTones(name);
      const checkProjectName = await Projects.findOne({ name });
      const dataCreate = { ...req.body, members, slug };
      if (checkProjectName) {
        throw { message: 'Project already exist.' };
      }
      //Check project name existed?
      const createProject = await Projects.create({
        ...dataCreate,
      });
      const pipeline = [{ $match: { name: createProject.name } }].concat(
        this.query.queryMatchEmployeeInfor
      );
      const dataReturn = await Projects.aggregate(pipeline);
      return res.json({
        status: ERROR.NO_ERROR,
        message: 'Sucessfull.',
        data: dataReturn,
      });
    } catch (error) {
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Some trouble',
      });
    }
  }
  async updateProject(req, res) {
    try {
      // Time to update project.
      Object.assign(req.body, { updatedAt: Date() });
      // Get array ObjectId of member in new project.
      const members =
        req.body.members.length > 0
          ? req.body.members.map((value) => ObjectID(value))
          : '';
      req.body.start = moment(req.body.start);
      req.body.end = moment(req.body.end);
      const checkProjectExist = await Projects.findOne({
        _id: ObjectID(req.params.id),
      });
      if (!checkProjectExist) {
        throw { message: 'Project not exists in DB.' };
      }
      const checkNameNew = await Projects.findOne({ name: req.body.name });
      const dataUpdate = { ...req.body, members };
      // Check name of new Project have existed?  If name project not change -> update.
      if (!checkNameNew || checkProjectExist.name === req.body.name) {
        await Projects.findOneAndUpdate(
          { _id: req.params.id },
          {
            $set: { ...dataUpdate },
          }
        );
        const matchEmployeeInProject = this.query.matchEmployeeInProject;
        const pipeline = [
          {
            $match: { _id: ObjectID(req.params.id) },
          },
        ].concat(matchEmployeeInProject);
        const dataRespone = await Projects.aggregate(pipeline);

        return res.json({
          status: ERROR.NO_ERROR,
          data: dataRespone,
          message: 'Sucessfull.',
        });
      }
      throw { message: 'Project had exist in DB.' };
    } catch (error) {
      return res.send({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Some trouble',
      });
    }
  }
  async deleteProject(req, res) {
    try {
      const { projectDelete } = req.body;
      await Promise.all(
        projectDelete.map(async (projectID) => {
          await Projects.deleteOne({
            _id: ObjectID(projectID),
          });
          await Ots.deleteMany({ project: projectID });
          await Onsites.deleteMany({ project: projectID });
        })
      );
      return res.json({
        status: ERROR.NO_ERROR,
        message: 'Successfull.',
      });
    } catch (error) {
      res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Some trouble',
      });
    }
  }
  async searchHaveCondition(req, res) {
    try {
      // get pageSize pageNo by req.query.
      const { pageSize = 10, pageNo = 1 } = req.query;
      let { name, state, start, end } = req.body;
      let pipeline = '';
      const nameCompare = removeVietnameseTones(name);
      let listProjects;
      // name = reUseFunction.removeVietnameseTones(name);
      const dateConditions = this.query.dateConditionsProject(start, end);

      if (dateConditions === '') {
        pipeline = this.query.queryGetAllProjects(nameCompare, state);
      } else {
        pipeline = this.query.matchProjectHaveConditions(
          nameCompare,
          state,
          dateConditions
        );
      }
      listProjects = await Projects.aggregate(pipeline);

      const total = listProjects.length;
      // pipeline split page
      pipeline = pipeline.concat(querySplitPagination(pageNo, pageSize));
      const dataResponse = await Projects.aggregate(pipeline);
      return res.json({
        status: ERROR.NO_ERROR,
        data: dataResponse,
        total,
      });
    } catch (error) {
      console.log('error', error);
      return res.json({
        status: ERROR.HANDLE_ERROR,
        message: error.message || 'Some trouble',
      });
    }
  }
}
module.exports = ProjectController;
