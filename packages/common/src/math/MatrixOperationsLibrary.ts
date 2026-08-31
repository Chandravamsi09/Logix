/**
 * High-Performance 2D/3D Matrix Operations for Telemetry & Geolocation
 */

export class MatrixOperationsLibrary {
  public static multiply(a: number[][], b: number[][]): number[][] {
    const rowsA = a.length;
    const colsA = a[0].length;
    const rowsB = b.length;
    const colsB = b[0].length;

    if (colsA !== rowsB) {
      throw new Error('Incompatible matrix dimensions for multiplication');
    }

    const result: number[][] = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

    for (let r = 0; r < rowsA; r++) {
      for (let c = 0; c < colsB; c++) {
        let sum = 0;
        for (let k = 0; k < colsA; k++) {
          sum += a[r][k] * b[k][c];
        }
        result[r][c] = +sum.toFixed(4);
      }
    }

    return result;
  }

  public static transpose(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result[c][r] = matrix[r][c];
      }
    }

    return result;
  }
}
