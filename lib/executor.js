/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var executor = require('nscale-util').executor();
var KILL = 'docker kill $(docker ps | grep __TARGETNAME__ | awk \'{print $1}\')';
var RUN = 'docker run __ARGUMENTS__';
var DELETE_UNTAGGED_CONGTAINERS = 'docker ps -a --no-trunc | grep Exit | awk \'{print $1}\' | xargs -I {} docker rm {}';
var DELETE_UNTAGGED_IMAGES = 'docker images --no-trunc| grep none | awk \'{print $3}\' | xargs -I {} docker rmi {}';



/**
 * deploy commands for demo - docker only
 */
module.exports = function(config) {


  var nameFromBin = function(container) {
    var name = null;

    if (container.specific && container.specific.containerBinary) {
      var bin = container.specific.containerBinary.split('/');
      name = bin[bin.length - 1];
    }
    return name;
  };



  var deploy = function(mode, targetHost, system, containerDef, container, out, cb) {
    cb();
  };



  var start = function(mode, targetHost, system, containerDef, container, out, cb) {
    var name = nameFromBin(container);
    name = system.namespace + '/' + name;
    var startCmd = RUN.replace('__ARGUMENTS__', containerDef.specific.arguments);
    startCmd = startCmd.replace(/__TARGETNAME__/g, name);
    executor.exec(mode, startCmd, config.imageCachePath, out, function(err) {
      out.preview({cmd: startCmd, host: 'localhost'});
      cb(err);
    });
  };



  var link = function(mode, targetHost, system, containerDef, container, out, cb) {
    cb();
  };



  var unlink = function(mode, targetHost, system, containerDef, container, out, cb) {
    cb();
  };


  /**
   * stop needs to 
   */
  var stop = function(mode, targetHost, system, containerDef, container, out, cb) {
    var name = nameFromBin(container);
    if (name) {
      name = system.namespace + '/' + name;
      var stopCmd = KILL.replace('__TARGETNAME__', name);
      executor.exec(mode, stopCmd, config.imageCachePath, out, function(err) {
        out.preview({cmd: stopCmd, host: 'localhost'});
        if (err && err.code !== 2) { cb(err); } else { cb(); }
      });
    }
    else {
      cb();
    }
  };



  /**
   * leave container in place clean down untagged
   */
  var undeploy = function(mode, targetHost, system, containerDef, container, out, cb) {
    //var name = nameFromBin(container);

    executor.exec(mode, DELETE_UNTAGGED_CONGTAINERS, config.imageCachePath, out, function(err) {
      out.preview({cmd: DELETE_UNTAGGED_CONGTAINERS, host: 'localhost'});
      if (err && err.code !== 1) { cb(err); }
      executor.exec(mode, DELETE_UNTAGGED_IMAGES, config.imageCachePath, out, function(err) {
        out.preview({cmd: DELETE_UNTAGGED_IMAGES, host: 'localhost'});
        if (err && err.code !== 1) { cb(err); } else { cb(); }
        /* disabled undeploy
        if (name) {
          var removeCmd = REMOVE.replace('__TARGETNAME__', name);
          executor.exec(mode, removeCmd, config.imageCachePath, out, function(err) {
            out.preview({cmd: removeCmd, host: 'localhost'});
            cb(err);
          });
        }
        else {
          cb();
        }
        */
      });
    });
  };



  var construct = function() {
  };



  construct();
  return {
    deploy: deploy,
    start: start,
    link: link,
    unlink: unlink,
    stop: stop,
    undeploy: undeploy
  };
};

