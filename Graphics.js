const VertexFormat = { XY: 2, XYZ: 3, XYZW: 4 };
const ColorFormat = { RGB: 3, RGBA: 4 };

class Graphics {
  constructor(canvas, camera) {
    this.gl = canvas.getContext('webgl');

    if (!this.gl) {
      alert('no webgl');
      return;
    }

    this.camera = camera;
    this.light = new Light(0.1, 0.9);

    this.programInfo = this.initShaderProgram(
      standardVertexShaderSource,
      standardFragmentShaderSource
    );
    this.normalLinesProgramInfo = this.initShaderProgram(
      normalLinesVertexShaderSource,
      normalLinesFragmentShaderSource
    );

    this.meshList = [];

    this.projection = mat4.perspective(
      mat4.create(),
      glm.toRadian(45),
      this.gl.drawingBufferWidth / this.gl.drawingBufferHeight,
      0.1,
      100
    );

    this.showNormals = false;
  }

  initShaderProgram(vertexShaderSource, fragmentShaderSource) {
    const gl = this.gl;
    const vShader = this.loadShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fShader = this.loadShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    gl.validateProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw 'Program link error: ' + gl.getProgramInfoLog(program);
    }

    const attributes = ['position', 'color', 'normal'];
    const uniforms = [
      'projection',
      'view',
      'model',
      'ambient',
      'diffuse',
      'direction',
      'normalMatrix',
    ];

    const attribLocations = {};
    for (const attrib of attributes) {
      attribLocations[attrib] = gl.getAttribLocation(program, attrib);
    }

    const uniformLocations = {};
    for (const uniform of uniforms) {
      uniformLocations[uniform] = gl.getUniformLocation(program, uniform);
    }

    return {
      program,
      attribLocations,
      uniformLocations,
    };
  }

  loadShader(type, shaderSource) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, shaderSource);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw 'Shader compile error: ' + this.gl.getShaderInfoLog(shader);
    }

    return shader;
  }

  render(deltaTime) {
    const gl = this.gl;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.DEPTH_TEST);
    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const up = vec3.fromValues(0, 1, 0);
    const eye = this.camera.position;
    const target = vec3.sub(
      vec3.create(),
      this.camera.position,
      this.camera.direction
    );
    const viewMat = mat4.lookAt(mat4.create(), eye, target, up);
    const modelMat = mat4.fromTranslation(mat4.create(), [0, 0, 0]);

    {
      gl.useProgram(this.programInfo.program);
      const {
        projection,
        view,
        model,
        ambient,
        diffuse,
        direction,
        normalMatrix,
      } = this.programInfo.uniformLocations;

      gl.uniformMatrix4fv(projection, gl.FALSE, this.projection);
      gl.uniformMatrix4fv(view, gl.FALSE, viewMat);
      gl.uniformMatrix4fv(model, gl.FALSE, modelMat);
      gl.uniformMatrix4fv(normalMatrix, gl.FALSE, mat4.create());
      gl.uniform1f(ambient, this.light.ambient);
      gl.uniform1f(diffuse, this.light.diffuse);
      //console.log(this.light.direction);
      gl.uniform3fv(direction, this.light.direction);

      this.meshList.forEach((mesh) =>
        mesh.render(this.programInfo.attribLocations)
      );
    }

    if (this.showNormals) {
      gl.useProgram(this.normalLinesProgramInfo.program);
      const { projection, view, model } =
        this.normalLinesProgramInfo.uniformLocations;

      gl.uniformMatrix4fv(projection, gl.FALSE, this.projection);
      gl.uniformMatrix4fv(view, gl.FALSE, viewMat);
      gl.uniformMatrix4fv(model, gl.FALSE, modelMat);

      this.meshList.forEach((mesh) =>
        mesh.renderNormals(this.programInfo.attribLocations)
      );
    }
  }
}
