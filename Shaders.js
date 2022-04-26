const standardVertexShaderSource = `
attribute vec4 position;
attribute vec4 color;
attribute vec4 normal;

varying vec4 vColor;
varying vec4 vNormal;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

void main() {
  gl_Position = projection * view * model * position;
  vColor = color;
  vNormal = normal;
}`;

const standardFragmentShaderSource = `
varying lowp vec4 vColor;
varying lowp vec4 vNormal;

uniform lowp float ambient;
uniform lowp float diffuse;
uniform lowp vec3 direction;
uniform lowp mat4 normalMatrix;

void main() {
  lowp vec3 normal = vec3(normalMatrix * vNormal);
  lowp float diffuseStrength = max(dot(direction, normal), 0.0) * diffuse;
  lowp float lightStrength = min(1.0, ambient + diffuseStrength);
  gl_FragColor = vec4(vec3(vColor) * lightStrength, 1.0);
}`;

const normalLinesVertexShaderSource = `
attribute vec4 position;
attribute vec4 color;

varying vec4 vColor;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

void main() {
  gl_Position = projection * view * model * position;
  vColor = color;
}`;

const normalLinesFragmentShaderSource = `
varying lowp vec4 vColor;

void main() {
  gl_FragColor = vColor;
}`;
