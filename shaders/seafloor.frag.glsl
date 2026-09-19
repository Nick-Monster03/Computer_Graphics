#version 300 es
precision mediump float;

in vec2 vTexCoord;
in vec3 vPositionEye;

uniform sampler2D uSandTexture;
uniform vec3 uFogColor;
uniform float uFogDensity;

out vec4 outColor;

void main() {
    vec4 sandColor = texture(uSandTexture, vTexCoord);

    float dist = length(vPositionEye);
    float fogFactor = 1.0 - exp(-uFogDensity * dist);
    vec3 finalColor = mix(sandColor.rgb, uFogColor, fogFactor);

    outColor = vec4(finalColor, sandColor.a);
}
