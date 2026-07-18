import type {
  MaterialAttachment,
  ParticipantGroup,
  StudyMaterial,
} from "../types/study.ts";

type MaterialsIndex = {
  materials: Array<string | { id?: string; path: string }>;
};

export type NormalizedAttachment = { filename: string; path: string };

export function stripComments(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripComments);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.startsWith("_") && !key.startsWith("not_used"))
        .map(([key, child]) => [key, stripComments(child)]),
    );
  }
  return value;
}

export async function loadMaterials(): Promise<StudyMaterial[]> {
  const indexResponse = await fetch("/materials/materials_index.json", {
    cache: "no-store",
  });
  if (!indexResponse.ok) {
    throw new Error(`无法加载材料索引（HTTP ${indexResponse.status}）。`);
  }
  const index = (await indexResponse.json()) as MaterialsIndex;
  if (!Array.isArray(index.materials)) {
    throw new Error("材料索引格式错误：缺少 materials 数组。");
  }
  return Promise.all(
    index.materials.map(async (entry) => {
      const path = typeof entry === "string" ? entry : entry.path;
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`无法加载材料 ${path}（HTTP ${response.status}）。`);
      }
      return stripComments(await response.json()) as StudyMaterial;
    }),
  );
}

function present(value: unknown): boolean {
  return typeof value === "string" ? value.trim().length > 0 : value !== undefined;
}

export function shouldShowAiTag(
  material: StudyMaterial,
  group: ParticipantGroup,
): boolean {
  const enabled = material.display?.ai_detection_label?.enabled_by_group;
  return group === "A" ? enabled?.group_A === true : enabled?.group_B === true;
}

export function validateMaterials(materials: StudyMaterial[]): string[] {
  const errors: string[] = [];
  if (materials.length !== 24) {
    errors.push(`应有 24 条材料，实际加载 ${materials.length} 条。`);
  }
  const seen = new Set<string>();
  for (const [index, material] of materials.entries()) {
    const label = material?.id || `第 ${index + 1} 条材料`;
    if (!present(material?.id)) errors.push(`${label} 缺少 id。`);
    else if (seen.has(material.id)) errors.push(`材料 ID 重复：${material.id}。`);
    else seen.add(material.id);

    const required: Array<[unknown, string]> = [
      [material?.display?.scenario_title, "display.scenario_title"],
      [material?.display?.scenario_context, "display.scenario_context"],
      [material?.display?.prompt_text, "display.prompt_text"],
      [material?.display?.ai_detection_label, "display.ai_detection_label"],
      [material?.metadata?.task_type, "metadata.task_type"],
      [material?.metadata?.scenario, "metadata.scenario"],
      [material?.metadata?.authorship_style, "metadata.authorship_style"],
      [material?.metadata?.condition, "metadata.condition"],
      [material?.metadata?.primary_risk, "metadata.primary_risk"],
      [material?.metadata?.ai_tag_group_A, "metadata.ai_tag_group_A"],
      [material?.metadata?.ai_tag_group_B, "metadata.ai_tag_group_B"],
      [material?.ground_truth?.contains_risk, "ground_truth.contains_risk"],
    ];
    for (const [value, field] of required) {
      if (!present(value)) errors.push(`${label} 缺少 ${field}。`);
    }
    if (material?.metadata?.authorship_style !== "human_style" && material?.metadata?.authorship_style !== "ai_style") {
      errors.push(`${label} 的 authorship_style 无效。`);
    }
    if (material?.metadata?.condition !== "risk" && material?.metadata?.condition !== "control") {
      errors.push(`${label} 的 condition 无效。`);
    }
    const attachments = material?.display?.attached_files;
    if (attachments !== undefined && !Array.isArray(attachments)) {
      errors.push(`${label} 的 attached_files 必须是数组。`);
    } else if (Array.isArray(attachments)) {
      attachments.forEach((attachment, attachmentIndex) => {
        if (typeof attachment === "string") {
          if (!attachment.trim()) errors.push(`${label} 的第 ${attachmentIndex + 1} 个附件为空。`);
        } else if (!attachment || typeof attachment !== "object") {
          errors.push(`${label} 的第 ${attachmentIndex + 1} 个附件格式无效。`);
        } else {
          const normalized = attachment as MaterialAttachment;
          if (!present(normalized.file_path ?? normalized.path)) {
            errors.push(`${label} 的第 ${attachmentIndex + 1} 个附件缺少路径。`);
          }
          if (!present(normalized.display_name ?? normalized.filename ?? normalized.label)) {
            errors.push(`${label} 的第 ${attachmentIndex + 1} 个附件缺少显示名称。`);
          }
        }
      });
    }
    const displayTags = material?.display?.ai_detection_label?.enabled_by_group;
    if (displayTags && material.metadata) {
      if ((displayTags.group_A ? "Yes" : "No") !== material.metadata.ai_tag_group_A) {
        errors.push(`${label} 的 Group A 标签字段不一致。`);
      }
      if ((displayTags.group_B ? "Yes" : "No") !== material.metadata.ai_tag_group_B) {
        errors.push(`${label} 的 Group B 标签字段不一致。`);
      }
    }
  }

  for (const group of ["A", "B"] as const) {
    const tagged = materials.filter((material) => shouldShowAiTag(material, group));
    const human = tagged.filter((material) => material.metadata.authorship_style === "human_style").length;
    const ai = tagged.filter((material) => material.metadata.authorship_style === "ai_style").length;
    if (tagged.length !== 12) errors.push(`Group ${group} 有 ${tagged.length} 条标签材料，而不是 12 条。`);
    if (human !== 6 || ai !== 6) {
      errors.push(`Group ${group} 标签材料中 human_style=${human}、ai_style=${ai}，应各为 6 条。`);
    }
  }
  return errors;
}

export function normalizeAttachments(material: StudyMaterial): NormalizedAttachment[] {
  const attachments = material.display.attached_files ?? [];
  return attachments.flatMap((attachment): NormalizedAttachment[] => {
    if (typeof attachment === "string") {
      return [{ filename: attachment.split("/").pop() || attachment, path: attachment }];
    }
    const item = attachment as MaterialAttachment;
    const path = item.file_path ?? item.path;
    const filename = item.display_name ?? item.filename ?? item.label ?? path?.split("/").pop();
    return path && filename ? [{ filename, path }] : [];
  });
}
