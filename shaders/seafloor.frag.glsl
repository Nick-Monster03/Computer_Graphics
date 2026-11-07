#version 300 es
precision mediump float;

#define MAX_ROCKS 8                     

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vPositionEye;
in vec2 vWorldXZ;                       

uniform sampler2D uSandTexture;

uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uAmbientColor;

uniform vec3  uFogColor;
uniform float uFogDensity;

uniform vec3 uRocks[MAX_ROCKS];         
uniform int  uRockCount;                

out vec4 outColor;

void main() {
    vec3 sand = texture(uSandTexture, vTexCoord).rgb;

    vec3 N = normalize(vNormal);
    vec3 L = normalize(uLightDirection);
    float diffuse = max(dot(N, L), 0.0);

    vec3 color = sand * (uAmbientColor + diffuse * uLightColor);

    float shade = 1.0;
    for (int i = 0; i < MAX_ROCKS; i++) {
        if (i >= uRockCount) break;
        float d = distance(vWorldXZ, uRocks[i].xy);
        float r = uRocks[i].z;
        shade *= mix(0.45, 1.0, smoothstep(0.7 * r, 1.5 * r, d));
    }
    color *= shade;

    float f = uFogDensity * length(vPositionEye);
    float fogFactor = 1.0 - exp(-f * f);
    outColor = vec4(mix(color, uFogColor, fogFactor), 1.0);
}