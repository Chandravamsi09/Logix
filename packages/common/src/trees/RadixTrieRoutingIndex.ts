/**
 * Compressed Radix Trie Prefix Index for High-Speed Route & SKU Matching
 */

export interface IRadixNode<T> {
  prefix: string;
  isLeaf: boolean;
  value?: T;
  children: Map<string, IRadixNode<T>>;
}

export class RadixTrieRoutingIndex<T> {
  private readonly root: IRadixNode<T> = {
    prefix: '',
    isLeaf: false,
    children: new Map()
  };

  public insert(key: string, value: T): void {
    let curr = this.root;
    let remaining = key;

    while (remaining.length > 0) {
      let matched = false;
      for (const [childKey, childNode] of curr.children.entries()) {
        const commonLen = this.getCommonPrefixLength(remaining, childNode.prefix);
        if (commonLen > 0) {
          matched = true;
          if (commonLen === childNode.prefix.length) {
            curr = childNode;
            remaining = remaining.substring(commonLen);
            break;
          } else {
            // Split node
            const splitNode: IRadixNode<T> = {
              prefix: childNode.prefix.substring(commonLen),
              isLeaf: childNode.isLeaf,
              value: childNode.value,
              children: childNode.children
            };

            childNode.prefix = childNode.prefix.substring(0, commonLen);
            childNode.isLeaf = false;
            childNode.value = undefined;
            childNode.children = new Map();
            childNode.children.set(splitNode.prefix[0], splitNode);

            if (commonLen === remaining.length) {
              childNode.isLeaf = true;
              childNode.value = value;
              return;
            } else {
              const newNode: IRadixNode<T> = {
                prefix: remaining.substring(commonLen),
                isLeaf: true,
                value,
                children: new Map()
              };
              childNode.children.set(newNode.prefix[0], newNode);
              return;
            }
          }
        }
      }

      if (!matched) {
        const newNode: IRadixNode<T> = {
          prefix: remaining,
          isLeaf: true,
          value,
          children: new Map()
        };
        curr.children.set(newNode.prefix[0], newNode);
        return;
      }
    }

    curr.isLeaf = true;
    curr.value = value;
  }

  public lookup(key: string): T | undefined {
    let curr = this.root;
    let remaining = key;

    while (remaining.length > 0) {
      const child = curr.children.get(remaining[0]);
      if (!child) return undefined;
      if (!remaining.startsWith(child.prefix)) return undefined;

      remaining = remaining.substring(child.prefix.length);
      curr = child;
    }

    return curr.isLeaf ? curr.value : undefined;
  }

  private getCommonPrefixLength(a: string, b: string): number {
    let len = 0;
    const min = Math.min(a.length, b.length);
    while (len < min && a[len] === b[len]) {
      len++;
    }
    return len;
  }
}
