class Mesh {
  constructor(
    gl,
    { vertices, vertexFormat, indices, colors, colorFormat, normals }
  ) {
    console.log({
      vertices,
      vertexFormat,
      indices,
      colors,
      colorFormat,
      normals,
    });
    if (
      !vertices ||
      !vertexFormat ||
      !indices ||
      !colors ||
      !colorFormat ||
      !normals
    ) {
      throw 'Bad model data';
    }
    this.gl = gl;

    this.vertices = vertices;
    this.vertexFormat = vertexFormat;
    this.indices = indices;
    this.colors = colors;
    this.colorFormat = colorFormat;
    this.normals = normals;
    if (!this.normals.length) {
      this.calculateNormals();
    }
    this.normalLines = [];
    this.normalLinesVertexCount = 0;
    this.normalLinesColors = [];
    this.normalLinesColorFormat = ColorFormat.RGB;
    var n = 0;
    for (var i = 0; i < this.vertices.length; i += this.vertexFormat, n++) {
      for (var v = 0; v < 3; v++) {
        this.normalLines[n * 6 + v] = this.vertices[i + v];
        this.normalLines[n * 6 + v + 3] =
          this.vertices[i + v] + this.normals[i + v];
      }
      this.normalLinesColors = this.normalLinesColors.concat([
        0, 1, 0, 0, 1, 0,
      ]);
      this.normalLinesVertexCount += 2;
    }

    this.initBuffers();
  }

  initBuffers() {
    const gl = this.gl;

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.vertices),
      gl.STATIC_DRAW
    );

    this.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.colors),
      gl.STATIC_DRAW
    );

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.normals),
      gl.STATIC_DRAW
    );

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.indices),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    this.normalLinesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalLinesBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.normalLines),
      gl.STATIC_DRAW
    );

    this.normalLinesColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalLinesColorBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.normalLinesColors),
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  calculateNormals() {
    if (this.vertices.length % (this.vertexFormat * 3) !== 0) {
      throw 'Non-triangular face :(';
    }
    var vec;
    if (this.vertexFormat === VertexFormat.XY) {
      vec = vec2;
    } else if (this.vertexFormat === VertexFormat.XYZ) {
      vec = vec3;
    } else if (this.vertexFormat === VertexFormat.XYZW) {
      vec = vec4;
    }
    for (var i = 0; i < this.vertices.length; i += this.vertexFormat * 3) {
      // todo clean this up for vec2 and vec4
      const one = vec.fromValues(
        this.vertices[i + 0],
        this.vertices[i + 1],
        this.vertices[i + 2]
      );
      const two = vec.fromValues(
        this.vertices[i + 3],
        this.vertices[i + 4],
        this.vertices[i + 5]
      );
      const three = vec.fromValues(
        this.vertices[i + 6],
        this.vertices[i + 7],
        this.vertices[i + 8]
      );
      const s1 = vec.sub(vec.create(), one, two);
      const s2 = vec.sub(vec.create(), one, three);
      const result = vec.cross(vec.create(), s1, s2);
      vec.normalize(result, result);
      this.normals.push(result[0], result[1], result[2]);
      this.normals.push(result[0], result[1], result[2]);
      this.normals.push(result[0], result[1], result[2]);
    }
  }

  render({ position, color, normal }) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(
      position,
      this.vertexFormat,
      gl.FLOAT,
      gl.FALSE,
      0,
      0
    );
    gl.enableVertexAttribArray(position);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.vertexAttribPointer(color, this.colorFormat, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(color);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(normal, this.vertexFormat, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(normal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  renderNormals({ position, color }) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalLinesBuffer);
    gl.vertexAttribPointer(
      position,
      this.vertexFormat,
      gl.FLOAT,
      gl.FALSE,
      0,
      0
    );
    gl.enableVertexAttribArray(position);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalLinesColorBuffer);
    gl.vertexAttribPointer(color, this.colorFormat, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(color);

    gl.drawArrays(gl.LINES, 0, this.normalLinesVertexCount);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}
