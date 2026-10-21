#version 300 es
precision mediump float;

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vPositionEye;

uniform sampler2D uSandTexture;

uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uAmbientColor;

uniform vec3  uFogColor;
uniform float uFogDensity;

out vec4 outColor;

void main() {
    vec3 sand = texture(uSandTexture, vTexCoord).rgb;

    vec3 N = normalize(vNormal);
    vec3 L = normalize(uLightDirection);
    float diffuse = max(dot(N, L), 0.0);

    // la sabbia è opaca: niente speculare
    vec3 color = sand * (uAmbientColor + diffuse * uLightColor);

    float f = uFogDensity * length(vPositionEye);
    float fogFactor = 1.0 - exp(-f * f);
    outColor = vec4(mix(color, uFogColor, fogFactor), 1.0);
}