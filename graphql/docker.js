const Docker = require('dockerode')

const docker = new Docker({socketPath: '/var/run/docker.sock'});

module.exports = {
  docker: docker,
  
  getContainerId: async runID => {
    let matchingContainerId = null;
    let containers = await docker.listContainers()
    containers.forEach(container => {
      container.Mounts.forEach(mount => {
        if (mount.Destination.includes(runID)) {
          matchingContainerId = container.Id;
        }
      })
    })
    return matchingContainerId;
  },

  getLogs: async Id => {
    if (Id != null) {
      return (await docker.getContainer(Id).logs({'stdout': '1'})).toString()
    }
  }
}