#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uNormalMatrix;

out vec2 vTexCoord;
out vec3 vNormal;
out vec3 vPositionEye;

void main() {
    vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);

    vTexCoord    = aTexCoord;
    vNormal      = mat3(uNormalMatrix) * aNormal;
    vPositionEye = (uViewMatrix * worldPosition).xyz;

    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
}