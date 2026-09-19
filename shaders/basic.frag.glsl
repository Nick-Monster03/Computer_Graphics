#version 300 es
precision mediump float;

in vec3 vNormal; 

uniform vec3 uColor;

out vec4 outColor;

void main() {
    vec3 n = normalize(vNormal);
    vec3 color = n * 0.5 + 0.5; 
    outColor = vec4(color, 1.0);
}
