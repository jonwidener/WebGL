class Light {
  constructor(ambient = 1, diffuse = 0, direction = null) {
    this.ambient = ambient;
    this.diffuse = diffuse;
    this.direction = direction ?? vec3.fromValues(0, 0, -1);
  }
}
