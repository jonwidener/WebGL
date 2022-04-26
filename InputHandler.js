class InputHandler {
  constructor(camera) {
    this.keys = new Set();
    this.camera = camera;

    document.addEventListener('keydown', (event) => {
      this.keys.add(event.code);
    });

    document.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });
  }

  handleInput(deltaTime) {
    const forward = vec3.scale(vec3.create(), this.camera.direction, -1);
    const backward = vec3.scale(vec3.create(), forward, -1);
    const right = vec3.cross(vec3.create(), vec3.fromValues(0, 1, 0), backward);
    const left = vec3.scale(vec3.create(), right, -1);
    const up = vec3.cross(vec3.create(), backward, right);
    const down = vec3.scale(vec3.create(), up, -1);
    const move = vec3.create();

    const keys = this.keys;
    // Position
    if (keys.has('KeyA')) {
      vec3.add(move, move, left);
    }
    if (keys.has('KeyD')) {
      vec3.add(move, move, right);
    }
    if (keys.has('KeyW')) {
      vec3.add(move, move, forward);
    }
    if (keys.has('KeyS')) {
      vec3.add(move, move, backward);
    }
    if (keys.has('KeyZ') || keys.has('Space')) {
      vec3.add(move, move, up);
    }
    if (keys.has('KeyC')) {
      vec3.add(move, move, down);
    }
    vec3.normalize(move, move);
    vec3.scale(move, move, MOVE_SPEED * deltaTime);
    vec3.add(this.camera.position, this.camera.position, move);

    const rotate = { x: 0, y: 0 };
    // Rotation
    if (keys.has('ArrowLeft')) {
      rotate.x -= KEYBOARD_ROTATE_SPEED * deltaTime;
    }
    if (keys.has('ArrowRight')) {
      rotate.x += KEYBOARD_ROTATE_SPEED * deltaTime;
    }
    if (keys.has('ArrowUp')) {
      rotate.y -= KEYBOARD_ROTATE_SPEED * deltaTime;
    }
    if (keys.has('ArrowDown')) {
      rotate.y += KEYBOARD_ROTATE_SPEED * deltaTime;
    }
    if (rotate.x || rotate.y) {
      this.camera.yaw += rotate.x;
      this.camera.pitch += rotate.y;
      this.camera.pitch = Math.max(-89, Math.min(89, this.camera.pitch));
      this.camera.rotate();
    }
  }
}
