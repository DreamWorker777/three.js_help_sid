varying vec2 vUv;

uniform sampler2D texture;
uniform float bright;
uniform float contrast;
uniform float opacity;
uniform bool hover;
uniform bool select;

void main() {

    vec4 t = texture2D(texture, vUv);

    t = LinearTosRGB(t);

    t.r = t.r + bright;
    t.g = t.g + bright;
    t.b = t.b + bright;
    t.r = contrast * (t.r - 0.5) + 0.5;
    t.g = contrast * (t.g - 0.5) + 0.5;
    t.b = contrast * (t.b - 0.5) + 0.5;

    if(t.a != 0.0) {
        gl_FragColor = vec4(t.rgb, opacity);
    }
    vec4 bColor;
    bColor.r = hover ? 1.0 : 0.0;
    bColor.g = select ? 1.0 : 0.0;

    if(vUv.x > 0.99 || vUv.x < 0.01 || vUv.y > 0.99 || vUv.y < 0.01) {
        gl_FragColor = vec4(bColor.rgb, opacity);
    }

}