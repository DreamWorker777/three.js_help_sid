varying vec2 vUv;

uniform sampler2D texture;
uniform float opacity;

void main() {
    vec4 t = texture2D(texture, vUv);
    if(t.a != 0.0) {
        gl_FragColor = vec4(t.rgb, opacity);
    }
}