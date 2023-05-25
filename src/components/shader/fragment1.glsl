varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform float bright;
uniform float contrast;
void main() {
    vec4 t = texture2D(tDiffuse, vUv);
    t.r = t.r + bright;
    t.g = t.g + bright;
    t.b = t.b + bright;
    t.r = contrast * (t.r - 0.5) + 0.5;
    t.g = contrast * (t.g - 0.5) + 0.5;
    t.b = contrast * (t.b - 0.5) + 0.5;
    t = LinearTosRGB(t);
    gl_FragColor = vec4(t.rgb, 1.0);

}