#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uNormalMatrix;       
uniform vec3 uViewWorldPosition;  

out vec3 vNormal;         
out vec3 vSurfaceToView;  
out vec3 vPositionEye;    

void main() {
    vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);

    vNormal        = mat3(uNormalMatrix) * aNormal;
    vSurfaceToView = uViewWorldPosition - worldPosition.xyz;
    vPositionEye   = (uViewMatrix * worldPosition).xyz;

    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
}