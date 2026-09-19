#version 300 es

layout(location = 0) in vec3 aPosition;
layout(location = 2) in vec2 aTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

out vec2 vTexCoord;
out vec3 vPositionEye;

void main() {
    vTexCoord = aTexCoord;
    vPositionEye = (uViewMatrix * uModelMatrix * vec4(aPosition, 1.0)).xyz;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
}