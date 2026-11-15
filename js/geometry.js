export function createGrid(size = 50, divisions = 50, textureRepeat = 10) {
  const numVertsPerSide = divisions + 1;
  const numVertices = numVertsPerSide * numVertsPerSide;

  const positions = webglUtils.createAugmentedTypedArray(3, numVertices);
  const normals = webglUtils.createAugmentedTypedArray(3, numVertices);
  const texCoords = webglUtils.createAugmentedTypedArray(2, numVertices);

  const half = size / 2;

  for (let j = 0; j <= divisions; j++) {
    for (let i = 0; i <= divisions; i++) {
      const u = i / divisions;
      const v = j / divisions;

      const x = -half + u * size;
      const z = -half + v * size;

      positions.push(x, 0, z);
      normals.push(0, 1, 0); 
      texCoords.push(u * textureRepeat, v * textureRepeat); 
    }
  }

  const indices = webglUtils.createAugmentedTypedArray(3, divisions * divisions * 2, Uint16Array);
  for (let j = 0; j < divisions; j++) {
    for (let i = 0; i < divisions; i++) {
      const first = j * numVertsPerSide + i;
      const second = first + numVertsPerSide;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return {
    position: positions,
    normal: normals,
    texcoord: texCoords,
    indices: indices,
  };
}