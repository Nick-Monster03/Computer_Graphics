#version 300 es

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uViewWorldPosition;

out vec3 vNormal;
out vec3 vSurfaceToView;
out vec3 vPositionEye;
out vec2 vTexCoord;
out float vWorldY;                      

void main() {
    vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);

    vNormal        = mat3(uNormalMatrix) * aNormal;
    vSurfaceToView = uViewWorldPosition - worldPosition.xyz;
    vPositionEye   = (uViewMatrix * worldPosition).xyz;
    vTexCoord      = aTexCoord;
    vWorldY        = worldPosition.y;   

    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
}