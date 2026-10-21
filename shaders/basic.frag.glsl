#version 300 es
precision mediump float;

in vec3 vNormal;
in vec3 vSurfaceToView;
in vec3 vPositionEye;

uniform vec3 uLightDirection;   
uniform vec3 uLightColor;
uniform vec3 uAmbientColor;

uniform vec3  uDiffuseColor;    // Kd
uniform vec3  uSpecularColor;   // Ks
uniform float uShininess;       // Ns

uniform vec3  uFogColor;
uniform float uFogDensity;

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

    vec3 color = uAmbientColor * uDiffuseColor               
               + diffuse  * uLightColor * uDiffuseColor      
               + specular * uLightColor * uSpecularColor;    

    float f = uFogDensity * length(vPositionEye);
    float fogFactor = 1.0 - exp(-f * f);
    outColor = vec4(mix(color, uFogColor, fogFactor), 1.0);
}