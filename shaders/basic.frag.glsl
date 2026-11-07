#version 300 es
precision mediump float;

in vec3 vNormal;
in vec3 vSurfaceToView;
in vec3 vPositionEye;
in vec2 vTexCoord;
in float vWorldY;               

uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uAmbientColor;

uniform vec3  uDiffuseColor;    // Kd
uniform vec3  uSpecularColor;   // Ks
uniform float uShininess;       // Ns
uniform sampler2D uTexture;     // map_Kd (bianca se il materiale non ha texture)

uniform vec3  uFogColor;
uniform float uFogDensity;
uniform float uFloorY;          

out vec4 outColor;

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uLightDirection);
    vec3 V = normalize(vSurfaceToView);
    vec3 H = normalize(L + V);

    float diffuse  = max(dot(N, L), 0.0);
    float specular = 0.0;
    if (diffuse > 0.0) {
        specular = pow(max(dot(N, H), 0.0), uShininess);
    }

    vec3 albedo = uDiffuseColor * texture(uTexture, vTexCoord).rgb;

    vec3 color = uAmbientColor * albedo
               + diffuse  * uLightColor * albedo
               + specular * uLightColor * uSpecularColor;

    float contact = mix(0.65, 1.0, smoothstep(0.0, 0.5, vWorldY - uFloorY));
    color *= contact;

    float f = uFogDensity * length(vPositionEye);
    float fogFactor = 1.0 - exp(-f * f);
    outColor = vec4(mix(color, uFogColor, fogFactor), 1.0);
}