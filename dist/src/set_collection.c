/* ============================================================================
 *  实验 2  顺序表的应用——集合运算（交互版，兼容老 Dev-C++ 5.11 / C89）
 *
 *  本程序逐条实现实验内容要求的 8 项功能，函数名与指导书一致：
 *    (1) CreateSet()            创建一个空的集合
 *    (2) CreateSetFromArray()   从数组元素建立集合
 *    (3) Find()                 查找集合中是否存在元素 x
 *    (4) Add()                  往集合中增加元素 x（自动去重）
 *    (5) Delete()               删除集合中的元素 x
 *    (6) Union()                求两个集合的并集
 *    (7) Intersection()        求两个集合的交集
 *    (8) Print()                输出集合
 *  另附创新加分：Complement() 补集（可公选课程 = 全集 减 已修并集）。
 *
 *  数据元素按指导书规定为 char 型（单个字符），用定长数组（顺序表）存储。
 *  老 Dev-C++：打开本文件按 F11 编译运行；源码 GBK 编码、C89 写法。
 * ========================================================================== */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MaxSize 100          /* 顺序表最大容量（指导书 MaxSize） */

typedef char dataType;       /* 指导书规定：集合元素为 char 型 */

/* 顺序表结构体：data[] 存元素，size 记录当前元素个数 */
typedef struct {
    dataType data[MaxSize];
    int size;
} SqSet;

/* ----------------------------------------------------------------------------
 * (1) CreateSet()：创建一个空的集合（动态申请，size 置 0）
 * -------------------------------------------------------------------------- */
SqSet* CreateSet(void) {
    SqSet *t = (SqSet*)malloc(sizeof(SqSet));
    t->size = 0;
    return t;
}

/* ----------------------------------------------------------------------------
 * (3) Find(s, x)：查找 x 是否在集合中，存在返回 1，不存在返回 0
 * -------------------------------------------------------------------------- */
int Find(SqSet *s, dataType x) {
    int i;
    for (i = 0; i < s->size; i++) {
        if (s->data[i] == x) {
            return 1;
        }
    }
    return 0;
}

/* ----------------------------------------------------------------------------
 * (4) Add(s, x)：往集合中增加元素 x；已存在则不重复加入
 * -------------------------------------------------------------------------- */
void Add(SqSet *s, dataType x) {
    if (Find(s, x)) return;
    s->data[s->size] = x;
    s->size++;
}

/* ----------------------------------------------------------------------------
 * (2) CreateSetFromArray(a, n)：从数组 a 的前 n 个元素建立集合（去重）
 * -------------------------------------------------------------------------- */
SqSet* CreateSetFromArray(dataType a[], int n) {
    SqSet *t = CreateSet();
    int i;
    for (i = 0; i < n; i++) {
        Add(t, a[i]);        /* 复用 Add，保证不重复 */
    }
    return t;
}

/* ----------------------------------------------------------------------------
 * (5) Delete(s, x)：删除集合中的元素 x
 *  无序集合采用“末尾元素替换被删位置”的办法，省去整体前移，简单高效
 * -------------------------------------------------------------------------- */
void Delete(SqSet *s, dataType x) {
    int i;
    for (i = 0; i < s->size; i++) {
        if (s->data[i] == x) {
            s->data[i] = s->data[--s->size];
            return;
        }
    }
}

/* ----------------------------------------------------------------------------
 * (6) Union(a, b, c)：求并集 c = a 并 b（先装 a，再把 b 中没有的加入）
 * -------------------------------------------------------------------------- */
void Union(SqSet *a, SqSet *b, SqSet *c) {
    int i;
    c->size = 0;
    for (i = 0; i < a->size; i++) {
        c->data[c->size++] = a->data[i];
    }
    for (i = 0; i < b->size; i++) {
        if (!Find(c, b->data[i])) {
            c->data[c->size++] = b->data[i];
        }
    }
}

/* ----------------------------------------------------------------------------
 * (7) Intersection(a, b, c)：求交集 c = a 交 b（a 中同时也在 b 里的元素）
 * -------------------------------------------------------------------------- */
void Intersection(SqSet *a, SqSet *b, SqSet *c) {
    int i;
    c->size = 0;
    for (i = 0; i < a->size; i++) {
        if (Find(b, a->data[i])) {
            c->data[c->size++] = a->data[i];
        }
    }
}

/* 创新加分：Complement(U, chosen, c)：补集 c = U 减 chosen（全集里没被选中的） */
void Complement(SqSet *U, SqSet *chosen, SqSet *c) {
    int i;
    c->size = 0;
    for (i = 0; i < U->size; i++) {
        if (!Find(chosen, U->data[i])) {
            c->data[c->size++] = U->data[i];
        }
    }
}

/* ----------------------------------------------------------------------------
 * (8) Print(s)：输出集合，元素之间用空格隔开
 * -------------------------------------------------------------------------- */
void Print(SqSet *s) {
    int i;
    if (s->size == 0) {
        printf("(空集合)\n");
        return;
    }
    for (i = 0; i < s->size; i++) {
        printf("%c ", s->data[i]);
    }
    printf("\n");
}

/* 清空输入缓冲区，避免 scanf 后读到空行 */
void flushLine(void) {
    int ch;
    while ((ch = getchar()) != '\n' && ch != EOF) { }
}

/* 从一行输入里逐个读取字符（跳过空格、逗号），加入集合 s */
void ReadChars(SqSet *s, const char *prompt) {
    char line[MaxSize + 1];
    int i;
    printf("%s", prompt);
    if (fgets(line, sizeof(line), stdin) == NULL) return;
    for (i = 0; line[i] != '\0'; i++) {
        if (line[i] != ' ' && line[i] != ',' && line[i] != '\n' && line[i] != '\t') {
            Add(s, line[i]);
        }
    }
    printf("  已录入 %d 个元素。\n", s->size);
}

int main(void) {
    int choice;
    char x;
    SqSet *S, *A, *B, *C, *U, *taken, *open;

    S = CreateSet();          /* 作业区集合，启动时为空集合，体现 (1) */

    while (1) {
        printf("\n========== 顺序表集合运算系统 ==========\n");
        printf("  1. 运行指导书标准示例（从数组建立->并集->交集）\n");
        printf("  2. 查找元素 x（Find）\n");
        printf("  3. 增加元素 x（Add）\n");
        printf("  4. 删除元素 x（Delete）\n");
        printf("  5. 输出当前集合（Print）\n");
        printf("  6. 求两个集合的并集（Union）\n");
        printf("  7. 求两个集合的交集（Intersection，如共同好友）\n");
        printf("  8. 创新：可公选课程（并集 + 补集）\n");
        printf("  0. 退出\n");
        printf("请输入序号：");
        scanf("%d", &choice);
        flushLine();

        if (choice == 0) {
            printf("已退出，再见！\n");
            break;
        }

        /* 1. 复现指导书：从数组建立，输出，并集，交集 */
        if (choice == 1) {
            dataType a[] = {'a', 'c', 'e', 'h'};
            dataType b[] = {'f', 'h', 'b', 'g', 'd', 'a'};
            SqSet *s1 = CreateSetFromArray(a, 4);
            SqSet *s2 = CreateSetFromArray(b, 6);
            SqSet *s3 = CreateSet();
            printf("\n-- 指导书标准示例 --\n");
            printf("第一个集合的元素为："); Print(s1);
            printf("第二个集合的元素为："); Print(s2);
            Union(s1, s2, s3);
            printf("两个集合的并为："); Print(s3);
            Intersection(s1, s2, s3);
            printf("两个集合的交为："); Print(s3);
            free(s1); free(s2); free(s3);
        }
        /* 2. 查找 */
        else if (choice == 2) {
            printf("输入要查找的字符：");
            scanf("%c", &x);
            flushLine();
            if (Find(S, x)) printf("集合中存在元素 '%c'。\n", x);
            else printf("集合中不存在元素 '%c'。\n", x);
        }
        /* 3. 增加 */
        else if (choice == 3) {
            printf("输入要增加的字符：");
            scanf("%c", &x);
            flushLine();
            Add(S, x);
            printf("增加后集合："); Print(S);
        }
        /* 4. 删除 */
        else if (choice == 4) {
            printf("输入要删除的字符：");
            scanf("%c", &x);
            flushLine();
            Delete(S, x);
            printf("删除后集合："); Print(S);
        }
        /* 5. 输出当前作业集合 */
        else if (choice == 5) {
            printf("当前集合："); Print(S);
        }
        /* 6. 并集 */
        else if (choice == 6) {
            A = CreateSet(); B = CreateSet(); C = CreateSet();
            ReadChars(A, "输入集合 A 的字符（空格或逗号分隔）：");
            ReadChars(B, "输入集合 B 的字符：");
            Union(A, B, C);
            printf("A 并 B = "); Print(C);
            free(A); free(B); free(C);
        }
        /* 7. 交集（共同好友） */
        else if (choice == 7) {
            A = CreateSet(); B = CreateSet(); C = CreateSet();
            ReadChars(A, "输入同学A的好友代号：");
            ReadChars(B, "输入同学B的好友代号：");
            Intersection(A, B, C);
            printf("共同好友（A 交 B）= "); Print(C);
            free(A); free(B); free(C);
        }
        /* 8. 创新：可公选课程 = 全集 减 已修并集 */
        else if (choice == 8) {
            U = CreateSet(); A = CreateSet(); B = CreateSet();
            taken = CreateSet(); open = CreateSet();
            ReadChars(U, "输入全部课程全集代号：");
            ReadChars(A, "输入同学A已选：");
            ReadChars(B, "输入同学B已选：");
            Union(A, B, taken);
            printf("两人已修并集："); Print(taken);
            Complement(U, taken, open);
            printf("可公选课程："); Print(open);
            free(U); free(A); free(B); free(taken); free(open);
        }
        else {
            printf("无效序号，请重新输入。\n");
        }
    }

    system("pause");
    return 0;
}
