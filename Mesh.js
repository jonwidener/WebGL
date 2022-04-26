class Mesh {
  constructor(
    gl,
    { vertices, vertexFormat, indices, colors, colorFormat, normals }
  ) {
    this.gl = gl;

    this.vertices = vertices;
    this.vertexFormat = vertexFormat;
    this.indices = indices;
    this.colors = colors;
    this.colorFormat = colorFormat;
    this.normals = normals;
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
