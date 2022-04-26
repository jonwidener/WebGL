const triangle = {
  vertexFormat: VertexFormat.XYZ,
  vertices: [
    // NegZ
    -1, -1, -1, -1, 1, -1, 1, -1, -1,

    // NegX
    -1, -1, -1, -1, -1, 1, -1, 1, -1,

    // NegY
    -1, -1, -1, 1, -1, -1, -1, -1, 1,

    // AllPos
    -1, 1, -1, -1, -1, 1, 1, -1, -1,
  ],
  indices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  colorFormat: ColorFormat.RGB,
  colors: [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  ],
  normals: [
    0, 0, -1, 0, 0, -1, 0, 0, -1, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, -1, 0, 0, -1,
    0, 0, -1, 0, 0.5773502588272095, 0.5773502588272095, 0.5773502588272095,
    0.5773502588272095, 0.5773502588272095, 0.5773502588272095,
    0.5773502588272095, 0.5773502588272095, 0.5773502588272095,
  ],
};

class Camera {
  constructor(yaw = 0, pitch = 0, position = null, direction = null) {
    this.yaw = yaw;
    this.pitch = pitch;
    this.position = position ?? vec3.create();
    this.direction = direction ?? vec3.create();
  }

  rotate() {
    this.direction = vec3.fromValues(
      Math.cos(glm.toRadian(this.yaw)) * Math.cos(glm.toRadian(this.pitch)),
      Math.sin(glm.toRadian(this.pitch)),
      Math.sin(glm.toRadian(this.yaw)) * Math.cos(glm.toRadian(this.pitch))
    );
  }
}

const MODEL_DATA = triangle;

var showNormals = true;

function main() {
  const canvas = document.getElementById('theCanvas');
  const camera = new Camera(270);
  const graphics = new Graphics(canvas, camera);

  camera.position = vec3.fromValues(0, 0, -6);
  camera.direction = vec3.create();
  camera.rotate();

  const input = new InputHandler(camera);

  const sunDirection = vec4.create();
  var sunAngle = 0;
  var dayTime = 0;

  document
    .getElementById('showNormalsCheckbox')
    .addEventListener('click', (event) => (showNormals = event.target.checked));

  const updateUI = () => {
    document.getElementById('positionx').innerHTML =
      camera.position[0].toFixed(2);
    document.getElementById('positiony').innerHTML =
      camera.position[1].toFixed(2);
    document.getElementById('positionz').innerHTML =
      camera.position[2].toFixed(2);

    document.getElementById('directionx').innerHTML =
      camera.direction[0].toFixed(2);
    document.getElementById('directiony').innerHTML =
      camera.direction[1].toFixed(2);
    document.getElementById('directionz').innerHTML =
      camera.direction[2].toFixed(2);

    document.getElementById('showNormalsCheckbox').checked = showNormals;

    document.getElementById('dayTime').innerHTML = Math.round(dayTime);
    document.getElementById('sunAngle').innerHTML = sunAngle.toFixed(1);

    document.getElementById('sundirectionx').innerHTML =
      sunDirection[0].toFixed(2);
    document.getElementById('sundirectiony').innerHTML =
      sunDirection[1].toFixed(2);
    document.getElementById('sundirectionz').innerHTML =
      sunDirection[2].toFixed(2);
  };

  var now = undefined,
    deltaTime = 0,
    frameRateTimer = 0,
    frames = 0;
  const logicLoop = (timeStamp) => {
    if (!now) {
      now = timeStamp;
      frameRateTimer = now;
    }
    frames++;
    deltaTime = (timeStamp - now) / 1000;
    now = timeStamp;
    if (now - frameRateTimer > 1000) {
      document.getElementById('fps').innerHTML = frames;
      frames = 0;
      frameRateTimer = now;
    }

    // Sun update
    dayTime += deltaTime;
    dayTime = dayTime >= DAY_PERIOD ? dayTime - DAY_PERIOD : dayTime;
    sunAngle = (dayTime / DAY_PERIOD) * 360;
    const rotationMat = mat4.fromRotation(
      mat4.create(),
      glm.toRadian(sunAngle),
      vec3.fromValues(0, 0, 1)
    );
    vec4.transformMat4(sunDirection, vec4.fromValues(-1, 0, 0, 1), rotationMat);
    vec3.copy(graphics.light.direction, sunDirection);

    updateUI();
    input.handleInput(deltaTime);
    graphics.showNormals = showNormals;

    graphics.render(deltaTime);
    window.requestAnimationFrame(logicLoop);
  };

  window.requestAnimationFrame(logicLoop);
}
