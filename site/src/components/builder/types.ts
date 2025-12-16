export interface TreeNode {
  id: string;
  label: string;
  type: "group" | "surface" | "action" | "text";
  children?: TreeNode[];
}
