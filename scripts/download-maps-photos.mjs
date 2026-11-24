import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, "../public/images/store");
mkdirSync(outDir, { recursive: true });

const thumbs = [
  "https://lh3.googleusercontent.com/gps-cs/AAjk-CPE1fTGLf61rSGcAM4H5exAabkZs8quOQenXS5NzN0JlUTAqnhiEwulvrVlIMbMB9XYxg_BWfPbTX_NIA01FR-uVCp6_RVP1dTpygdEdQ0xvT7IH878aegi80QAXFcSz7c0Jxqcy-U669JZ=w600-h650-p-k-no",
  "https://lh3.googleusercontent.com/gps-cs/AAjk-CPf6ip2PAy1wSUQy2wpVtmKGMqjhrDMrmfja1hLe2UFcM6eLOwMTfcUf95D-sLJ7WPGC3kplzHf8qyBcfcF32W6cKYWdRbuMowqKX_azxO_-rs6FkjOA1AqYlzZCjiAPfa4deLf85i2oJCy=w600-h650-p-k-no",
  "https://lh3.googleusercontent.com/gps-cs/AAjk-CNuXdGnWVOspTTnA7pfc9UZQWb6xi_T1ubNn869dGqKd53a3KO6U6cyKWGS9zCrbQWLQWwV-ZakposbeVkj9G6Gh82CSw8gTOvk2s_aerbHKI6A8KzUPD3dNZ8v9e4uQAFBvqmR6407vFik=w600-h650-p-k-no",
  "https://lh3.googleusercontent.com/gps-cs/AAjk-CO4_Kb2FvT9NPFBMO4HrGbffELuHIl7dAORwrPbV7kHGRnPQtX3y1--gwGRPaNxgBLcQzB92NDwgOH_gawgJ98aknEhmvd0ebRIToIzRsjUnM3ZJUBpaWP8Y6OqCMaILBPs2K5fKcODCwb8=w600-h650-p-k-no",
  "https://lh3.googleusercontent.com/gps-cs/AAjk-CMNFHCF6N3n5h5UjtIOGPc8ln9AFyMxci5IPq7CwZRkvVaFbmQo9eFRnMk6w0N5ScBo8oBpWW6t_vVVDl6uAsdaSq2dECbskXCfYTJ0mY30hUq_09PQPt4r84A1VczbzjMXlGveCh_v211j=w600-h650-p-k-no",
  "https://lh3.googleusercontent.com/gps-cs/AAjk-CPwZDTRvD7Ss2JqbLnkAtqlYghkAVlYq86wq54yf9Mz6RcFY8aTvh5VpLeaqARbACbujIiF0o6rTyYY0fiojpNdycP-YObKBo4NWhZkbenlgZeK3WD3RdSzBtgLaDr5pP3kbMRBICrYwDS1=w600-h650-p-k-no",
  "https://lh3.googleusercontent.com/gps-cs/AAjk-COFXEqm43SkHXqHVaI4kSIUJLU8h49GNpCbxMzZnIZ7jOMd_rM422bumsD1N553nj3LQGYdfobTloU10adfNfzJElK26fL1wtrokFSmBL1yCevWvi3ipvjGbe2PQms_kOuZ40xmrfLRmVg=w600-h650-p-k-no",
  "https://lh3.googleusercontent.com/gps-cs/AAjk-CM7rjO6fflG5DER25spzzwOJALkPRtW5PEjLLQ-37mVmD7KpiOD4wHVnRpogWWMgmqPjdzEQXfoKyOG52EaVyNZYTVmRRj0HSBmKl1jCFZAMgi3XZStlEbGVmjUh39uTLWZBqPQkfk7cQfq=w600-h650-p-k-no",
  "https://lh3.googleusercontent.com/gps-cs/AAjk-CP3aek8caVigDJIAGkfPrdzJ14koRBoBaQaC_-dFy39mDJPUsOJ7npJmgHa8x5R4JniSkMYMcp0XhVbC2NzYo1LctE3h38fnaZt2W-2fdtu7gALN-i3xtIvkfn818I0CIIyNQGj7g4qSyM5=w600-h650-p-k-no",
  "https://lh3.googleusercontent.com/gps-cs/AAjk-CPH6Zj44FjriwVut__AKyzELkCFyqpkjxyteClP5uEqV652ldD5Oj4-2yCslYrJuqfmjkcMxqT0RIvc-s3btnBxfDoHXtS_qTYOmbGNl-hNE5lKjfxMOafp3qJrr2kf_n3_u6lKCf0tA83e=w600-h650-p-k-no",
];

function hiRes(url) {
  return url.replace(/=w\d+-h\d+-p-k-no$/, "=s1600-k-no").replace(/=w\d+-h\d+-k-no$/, "=s1600-k-no");
}

for (let i = 0; i < thumbs.length; i++) {
  const url = hiRes(thumbs[i]);
  const res = await fetch(url);
  if (!res.ok) {
    console.error("fail", i + 1, res.status, url.slice(0, 80));
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const file = path.join(outDir, `store-${String(i + 1).padStart(2, "0")}.jpg`);
  writeFileSync(file, buf);
  console.log("saved", path.basename(file), buf.length);
}
