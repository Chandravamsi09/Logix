/**
 * B+ Tree Multi-Way Search Index for Order & Ledger Range Queries
 */

export class BPlusTreeNode<K, V> {
  public isLeaf: boolean;
  public keys: K[];
  public values: V[];
  public children: BPlusTreeNode<K, V>[];
  public next: BPlusTreeNode<K, V> | null = null;

  constructor(isLeaf = false) {
    this.isLeaf = isLeaf;
    this.keys = [];
    this.values = [];
    this.children = [];
  }
}

export class BPlusTreeDatabaseIndex<K, V> {
  private root: BPlusTreeNode<K, V>;
  private readonly order: number;

  constructor(order = 4) {
    this.order = order;
    this.root = new BPlusTreeNode<K, V>(true);
  }

  public search(key: K): V | null {
    let curr = this.root;
    while (!curr.isLeaf) {
      let idx = 0;
      while (idx < curr.keys.length && key >= curr.keys[idx]) {
        idx++;
      }
      curr = curr.children[idx];
    }

    for (let i = 0; i < curr.keys.length; i++) {
      if (curr.keys[i] === key) {
        return curr.values[i];
      }
    }
    return null;
  }

  public insert(key: K, value: V): void {
    const root = this.root;
    if (root.keys.length === (2 * this.order) - 1) {
      const s = new BPlusTreeNode<K, V>(false);
      this.root = s;
      s.children.push(root);
      this.splitChild(s, 0, root);
      this.insertNonFull(s, key, value);
    } else {
      this.insertNonFull(root, key, value);
    }
  }

  private insertNonFull(node: BPlusTreeNode<K, V>, key: K, value: V): void {
    let i = node.keys.length - 1;
    if (node.isLeaf) {
      while (i >= 0 && key < node.keys[i]) {
        i--;
      }
      node.keys.splice(i + 1, 0, key);
      node.values.splice(i + 1, 0, value);
    } else {
      while (i >= 0 && key < node.keys[i]) {
        i--;
      }
      i++;
      if (node.children[i].keys.length === (2 * this.order) - 1) {
        this.splitChild(node, i, node.children[i]);
        if (key > node.keys[i]) {
          i++;
        }
      }
      this.insertNonFull(node.children[i], key, value);
    }
  }

  private splitChild(parent: BPlusTreeNode<K, V>, idx: number, child: BPlusTreeNode<K, V>): void {
    const t = this.order;
    const z = new BPlusTreeNode<K, V>(child.isLeaf);
    parent.children.splice(idx + 1, 0, z);
    parent.keys.splice(idx, 0, child.keys[t - 1]);

    z.keys = child.keys.splice(t, child.keys.length - t);
    if (child.isLeaf) {
      z.values = child.values.splice(t - 1, child.values.length - (t - 1));
      z.next = child.next;
      child.next = z;
    } else {
      z.children = child.children.splice(t, child.children.length - t);
    }
    child.keys.pop();
  }
}
