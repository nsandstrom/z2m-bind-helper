export class Z2mClient {
  private pendingBindings = [] as any[]
  private devices = [] as any[]
  private groups = [] as any[]

  constructor() {
    console.log('Init')
  }

  private updatePendingBndings() {
    console.log('Update bindings')
    this.pendingBindings = []
  }

  updateGroups(groupListRaw) {
    console.log('groupListRaw')
    console.log(groupListRaw)
  }

  placeholder() {
    console.log(this.pendingBindings)
    console.log(this.devices)
    console.log(this.groups)
    console.log(this.updatePendingBndings)
  }
}
