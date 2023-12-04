// CurrentPathManager.ts
class CurrentPathManager {
  private currentPath: string = '/';

  setPath(path: string) {
    this.currentPath = path;
  }

  getPath() {
    return this.currentPath;
  }
}

const currentPathManager = new CurrentPathManager();
export default currentPathManager;
