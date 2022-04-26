class ObjFileReader {
  constructor(objFileText) {
    const text = objFileText.replace(/\r\n/gm, '\n');
    const dataArray = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length);
    console.log(dataArray);

    // this will grow
    const obj = {
      vertices: [],
      normals: [],
      faces: [],
    };

    const { vertices, normals, faces } = obj;
    let vertexFormat;

    // Parse string data into obj
    for (const line of dataArray) {
      const lineArray = line.split(/\s+/);
      if (line[0] === '#') {
        continue;
      }
      switch (lineArray[0]) {
        case 'v':
          if (![4, 5].includes(lineArray.length)) {
            throw 'Bad vertex line: ' + line;
          }
          if (!vertexFormat) {
            vertexFormat = lineArray.length - 1;
          }
          vertices.push(lineArray.slice(1).map((el) => parseFloat(el)));
          break;
        case 'vn':
          if (lineArray.length !== 4) {
            throw 'Bad normal line: ' + line;
          }
          normals.push(lineArray.slice(1).map((el) => parseFloat(el)));
          break;
        case 'f':
          const face = [];
          for (const entry of lineArray.slice(1)) {
            const match = entry.match(/^([0-9]+)\/?([0-9]*)(?:\/([0-9]+))?$/);
            const indices = [
              parseInt(match[1]),
              parseInt(match[2]),
              parseInt(match[3]),
            ];
            face.push(indices);
          }
          faces.push(face);
          break;
        case 'g':
        default:
          continue;
      }
    }

    console.log(obj);
    const modelData = {
      vertices: [],
      vertexFormat,
      indices: [],
      colors: [],
      colorFormat: ColorFormat.RGB,
      normals: [],
    };

    var idx = 0;
    // Convert obj data into modelData object
    for (const face of faces) {
      if (face.length !== 3) {
        // can't handle non-triangles yet
        throw 'Not a triangle';
      }
      for (const vertex of face) {
        modelData.vertices = modelData.vertices.concat(
          obj.vertices[vertex[0] - 1]
        );
        // no texture support atm
        if (!isNaN(vertex[2])) {
          modelData.normals = modelData.normals.concat(
            obj.normals[vertex[2] - 1]
          );
        }
        modelData.colors = modelData.colors.concat([1, 1, 1]); // default color to white
        modelData.indices.push(idx);
        idx++;
      }
    }
    console.log(modelData);

    return modelData;
  }
}
