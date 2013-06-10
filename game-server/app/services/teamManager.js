/**
 * Module dependencies
 */
var Team = require('../domain/entity/team');
var consts = require('../consts/consts');
var utils = require('../util/utils');

var exp = module.exports;

// global team container(teamId:teamObj)
var gTeamObjDict = {};
// global team id
var gTeamId = 0;

// create new team, add the player(captain) to the team
exp.createTeam = function(data) {
  var teamObj = new Team(++gTeamId);
  var result = teamObj.addPlayer(data);
  if(result === consts.TEAM.JOIN_TEAM_RET_CODE.OK) {
    teamObj.setCaptainId(data.playerId);
    gTeamObjDict[teamObj.teamId] = teamObj;
  }
	return {result: result, teamId: teamObj.teamId};
};

exp.getTeamById = function(teamId) {
  var teamObj = gTeamObjDict[teamId];
	return teamObj || null;
};

exp.disbandTeamById = function(playerId, teamId) {
  var teamObj = gTeamObjDict[teamId];
	if(!teamObj || !teamObj.isCaptainById(playerId)) {
    return {result: consts.TEAM.FAILED};
	}

  var ret = teamObj.disbandTeam();
  if(ret.result) {
    delete gTeamObjDict[teamId];
  }
	return ret;
};

// check member num when a member leaves the team,
// if there is no member in the team,
// disband the team automatically
exp.try2DisbandTeam = function(teamObj) {
  if(!teamObj.isTeamHasMember()) {
    delete gTeamObjDict[teamObj.teamId];
  }
};

exp.joinFirstTeam = function(data) {
  var teamId = consts.TEAM.TEAM_ID_NONE;
  var keys = Object.keys(gTeamObjDict);
  if (keys.length > 0) {
    teamId = parseInt(keys[0], null);
  }
  var result = consts.TEAM.JOIN_TEAM_RET_CODE.SYS_ERROR;
  var teamObj = gTeamObjDict[teamId];
  if (teamObj) {
    result = teamObj.addPlayer(data);
  }

  return {result: result, teamId: teamId};
};

exp.leaveTeamById = function(playerId, teamId, cb) {
  var teamObj = gTeamObjDict[teamId];
  if(!teamObj) {
    return {result: consts.TEAM.FAILED};
  }

  var _this = this;
  teamObj.removePlayer(playerId, function(err, ret) {
    if (ret.toDisband) {
      _this.disbandTeamById(playerId, teamId);
      delete ret.toDisband;
    }
    utils.invokeCallback(cb, null, ret);
  });
};
