import { useState, useMemo } from "react";
import { Database, Copy, Plus, Trash2, Play, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Column {
  name: string;
  table?: string;
  alias?: string;
  aggregate?: string;
}

interface Condition {
  column: string;
  operator: string;
  value: string;
  connector: "AND" | "OR";
}

interface Join {
  type: "INNER" | "LEFT" | "RIGHT" | "FULL";
  table: string;
  alias?: string;
  on: { leftColumn: string; rightColumn: string };
}

interface OrderBy {
  column: string;
  direction: "ASC" | "DESC";
}

const operators = [
  { value: "=", label: "= (égal)" },
  { value: "!=", label: "!= (différent)" },
  { value: ">", label: "> (supérieur)" },
  { value: "<", label: "< (inférieur)" },
  { value: ">=", label: ">= (sup. ou égal)" },
  { value: "<=", label: "<= (inf. ou égal)" },
  { value: "LIKE", label: "LIKE" },
  { value: "NOT LIKE", label: "NOT LIKE" },
  { value: "IN", label: "IN" },
  { value: "NOT IN", label: "NOT IN" },
  { value: "IS NULL", label: "IS NULL" },
  { value: "IS NOT NULL", label: "IS NOT NULL" },
  { value: "BETWEEN", label: "BETWEEN" },
];

const aggregates = [
  { value: "none", label: "Aucun" },
  { value: "COUNT", label: "COUNT" },
  { value: "SUM", label: "SUM" },
  { value: "AVG", label: "AVG" },
  { value: "MIN", label: "MIN" },
  { value: "MAX", label: "MAX" },
];

const templates = [
  {
    name: "SELECT simple",
    config: {
      queryType: "SELECT" as const,
      tableName: "users",
      columns: [{ name: "id" }, { name: "name" }, { name: "email" }],
      conditions: [],
      joins: [],
      orderBy: [],
      limit: 100,
    },
  },
  {
    name: "SELECT avec JOIN",
    config: {
      queryType: "SELECT" as const,
      tableName: "orders",
      tableAlias: "o",
      columns: [{ name: "id", table: "o" }, { name: "name", table: "u" }, { name: "total", table: "o" }],
      conditions: [],
      joins: [{ type: "LEFT" as const, table: "users", alias: "u", on: { leftColumn: "o.user_id", rightColumn: "u.id" } }],
      orderBy: [{ column: "o.created_at", direction: "DESC" as const }],
      limit: 50,
    },
  },
  {
    name: "SELECT avec GROUP BY",
    config: {
      queryType: "SELECT" as const,
      tableName: "orders",
      columns: [{ name: "user_id" }, { name: "total", aggregate: "SUM", alias: "total_spent" }, { name: "*", aggregate: "COUNT", alias: "order_count" }],
      conditions: [],
      joins: [],
      orderBy: [],
      groupBy: ["user_id"],
      limit: 0,
    },
  },
  {
    name: "INSERT",
    config: {
      queryType: "INSERT" as const,
      tableName: "users",
      insertColumns: ["name", "email", "created_at"],
      insertValues: ["'John Doe'", "'john@example.com'", "NOW()"],
    },
  },
  {
    name: "UPDATE",
    config: {
      queryType: "UPDATE" as const,
      tableName: "users",
      updateSets: [{ column: "name", value: "'Jane Doe'" }, { column: "updated_at", value: "NOW()" }],
      conditions: [{ column: "id", operator: "=", value: "1", connector: "AND" as const }],
    },
  },
  {
    name: "DELETE",
    config: {
      queryType: "DELETE" as const,
      tableName: "users",
      conditions: [{ column: "id", operator: "=", value: "1", connector: "AND" as const }],
    },
  },
];

type Dialect = "mysql" | "postgresql" | "sqlite" | "sqlserver";

export default function SqlQueryBuilder() {
  const { toast } = useToast();
  const [dialect, setDialect] = useState<Dialect>("postgresql");
  const [queryType, setQueryType] = useState<"SELECT" | "INSERT" | "UPDATE" | "DELETE">("SELECT");
  const [tableName, setTableName] = useState("users");
  const [tableAlias, setTableAlias] = useState("");
  const [columns, setColumns] = useState<Column[]>([{ name: "*" }]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [joins, setJoins] = useState<Join[]>([]);
  const [orderBy, setOrderBy] = useState<OrderBy[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);
  const [distinct, setDistinct] = useState(false);

  // INSERT specific
  const [insertColumns, setInsertColumns] = useState<string[]>(["name", "email"]);
  const [insertValues, setInsertValues] = useState<string[]>(["'John'", "'john@example.com'"]);

  // UPDATE specific
  const [updateSets, setUpdateSets] = useState<{column: string; value: string}[]>([{ column: "name", value: "'Updated'" }]);

  const generatedQuery = useMemo(() => {
    const q = dialect === "sqlserver" ? (s: string) => `[${s}]` : dialect === "mysql" ? (s: string) => `\`${s}\`` : (s: string) => `"${s}"`;
    
    let query = "";

    switch (queryType) {
      case "SELECT": {
        const selectCols = columns.map(col => {
          let colStr = col.table ? `${col.table}.${col.name}` : col.name;
          if (col.aggregate) {
            colStr = `${col.aggregate}(${colStr})`;
          }
          if (col.alias) {
            colStr += ` AS ${q(col.alias)}`;
          }
          return colStr;
        }).join(",\n       ");

        query = `SELECT${distinct ? " DISTINCT" : ""}\n       ${selectCols}\n  FROM ${q(tableName)}${tableAlias ? ` AS ${tableAlias}` : ""}`;

        for (const join of joins) {
          query += `\n  ${join.type} JOIN ${q(join.table)}${join.alias ? ` AS ${join.alias}` : ""} ON ${join.on.leftColumn} = ${join.on.rightColumn}`;
        }

        if (conditions.length > 0) {
          query += "\n WHERE ";
          query += conditions.map((cond, i) => {
            let condStr = i > 0 ? `${cond.connector} ` : "";
            if (cond.operator === "IS NULL" || cond.operator === "IS NOT NULL") {
              condStr += `${cond.column} ${cond.operator}`;
            } else if (cond.operator === "IN" || cond.operator === "NOT IN") {
              condStr += `${cond.column} ${cond.operator} (${cond.value})`;
            } else {
              condStr += `${cond.column} ${cond.operator} ${cond.value}`;
            }
            return condStr;
          }).join("\n       ");
        }

        if (groupBy.length > 0) {
          query += `\n GROUP BY ${groupBy.join(", ")}`;
        }

        if (orderBy.length > 0) {
          query += `\n ORDER BY ${orderBy.map(o => `${o.column} ${o.direction}`).join(", ")}`;
        }

        if (limit > 0) {
          if (dialect === "sqlserver") {
            query = query.replace("SELECT", `SELECT TOP ${limit}`);
          } else {
            query += `\n LIMIT ${limit}`;
            if (offset > 0) {
              query += ` OFFSET ${offset}`;
            }
          }
        }
        break;
      }

      case "INSERT": {
        const cols = insertColumns.map(c => q(c)).join(", ");
        const vals = insertValues.join(", ");
        query = `INSERT INTO ${q(tableName)} (${cols})\nVALUES (${vals})`;
        if (dialect === "postgresql") {
          query += "\nRETURNING *";
        }
        break;
      }

      case "UPDATE": {
        const sets = updateSets.map(s => `${q(s.column)} = ${s.value}`).join(",\n       ");
        query = `UPDATE ${q(tableName)}\n   SET ${sets}`;
        if (conditions.length > 0) {
          query += "\n WHERE ";
          query += conditions.map((cond, i) => {
            let condStr = i > 0 ? `${cond.connector} ` : "";
            condStr += `${cond.column} ${cond.operator} ${cond.value}`;
            return condStr;
          }).join("\n       ");
        }
        break;
      }

      case "DELETE": {
        query = `DELETE FROM ${q(tableName)}`;
        if (conditions.length > 0) {
          query += "\n WHERE ";
          query += conditions.map((cond, i) => {
            let condStr = i > 0 ? `${cond.connector} ` : "";
            condStr += `${cond.column} ${cond.operator} ${cond.value}`;
            return condStr;
          }).join("\n       ");
        }
        break;
      }
    }

    return query + ";";
  }, [queryType, tableName, tableAlias, columns, conditions, joins, orderBy, groupBy, limit, offset, distinct, dialect, insertColumns, insertValues, updateSets]);

  const loadTemplate = (templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    if (!template) return;
    
    const c = template.config;
    setQueryType(c.queryType);
    setTableName(c.tableName);
    setTableAlias((c as { tableAlias?: string }).tableAlias || "");
    setColumns((c as { columns?: Column[] }).columns || [{ name: "*" }]);
    setConditions((c as { conditions?: Condition[] }).conditions || []);
    setJoins((c as { joins?: Join[] }).joins || []);
    setOrderBy((c as { orderBy?: OrderBy[] }).orderBy || []);
    setGroupBy((c as { groupBy?: string[] }).groupBy || []);
    setLimit((c as { limit?: number }).limit ?? 100);
    setInsertColumns((c as { insertColumns?: string[] }).insertColumns || []);
    setInsertValues((c as { insertValues?: string[] }).insertValues || []);
    setUpdateSets((c as { updateSets?: {column: string; value: string}[] }).updateSets || []);
  };

  const copyQuery = () => {
    navigator.clipboard.writeText(generatedQuery);
    toast({ title: "Copié !", description: "Requête SQL copiée" });
  };

  const addColumn = () => setColumns([...columns, { name: "" }]);
  const addCondition = () => setConditions([...conditions, { column: "", operator: "=", value: "", connector: "AND" }]);
  const addJoin = () => setJoins([...joins, { type: "LEFT", table: "", on: { leftColumn: "", rightColumn: "" } }]);
  const addOrderBy = () => setOrderBy([...orderBy, { column: "", direction: "ASC" }]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" />
          SQL Query Builder
        </h1>
        <p className="text-muted-foreground">
          Construisez visuellement des requêtes SQL pour MySQL, PostgreSQL, SQLite et SQL Server
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Configuration</span>
                <Select onValueChange={loadTemplate}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Templates" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(t => (
                      <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dialecte SQL</Label>
                  <Select value={dialect} onValueChange={v => setDialect(v as Dialect)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                      <SelectItem value="sqlserver">SQL Server</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type de requête</Label>
                  <Select value={queryType} onValueChange={v => setQueryType(v as typeof queryType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SELECT">SELECT</SelectItem>
                      <SelectItem value="INSERT">INSERT</SelectItem>
                      <SelectItem value="UPDATE">UPDATE</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Table</Label>
                  <Input value={tableName} onChange={e => setTableName(e.target.value)} />
                </div>
                {queryType === "SELECT" && (
                  <div>
                    <Label>Alias (optionnel)</Label>
                    <Input value={tableAlias} onChange={e => setTableAlias(e.target.value)} placeholder="ex: u" />
                  </div>
                )}
              </div>

              {queryType === "SELECT" && (
                <div className="flex items-center gap-2">
                  <Switch checked={distinct} onCheckedChange={setDistinct} />
                  <Label>DISTINCT</Label>
                </div>
              )}
            </CardContent>
          </Card>

          {queryType === "SELECT" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Colonnes ({columns.length})</span>
                    <Button size="sm" variant="outline" onClick={addColumn}>
                      <Plus className="h-4 w-4 mr-1" /> Ajouter
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-48">
                    <div className="space-y-2">
                      {columns.map((col, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            placeholder="Colonne"
                            value={col.name}
                            onChange={e => {
                              const newCols = [...columns];
                              newCols[i] = { ...col, name: e.target.value };
                              setColumns(newCols);
                            }}
                            className="flex-1"
                          />
                          <Select
                            value={col.aggregate || "none"}
                            onValueChange={v => {
                              const newCols = [...columns];
                              newCols[i] = { ...col, aggregate: v === "none" ? undefined : v };
                              setColumns(newCols);
                            }}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue placeholder="Fn" />
                            </SelectTrigger>
                            <SelectContent>
                              {aggregates.map(a => (
                                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Alias"
                            value={col.alias || ""}
                            onChange={e => {
                              const newCols = [...columns];
                              newCols[i] = { ...col, alias: e.target.value || undefined };
                              setColumns(newCols);
                            }}
                            className="w-28"
                          />
                          <Button size="icon" variant="ghost" onClick={() => setColumns(columns.filter((_, idx) => idx !== i))}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>JOINs ({joins.length})</span>
                    <Button size="sm" variant="outline" onClick={addJoin}>
                      <Plus className="h-4 w-4 mr-1" /> Ajouter
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-48">
                    <div className="space-y-3">
                      {joins.map((join, i) => (
                        <div key={i} className="p-3 bg-muted/50 rounded-lg space-y-2">
                          <div className="flex gap-2">
                            <Select
                              value={join.type}
                              onValueChange={v => {
                                const newJoins = [...joins];
                                newJoins[i] = { ...join, type: v as Join["type"] };
                                setJoins(newJoins);
                              }}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="INNER">INNER</SelectItem>
                                <SelectItem value="LEFT">LEFT</SelectItem>
                                <SelectItem value="RIGHT">RIGHT</SelectItem>
                                <SelectItem value="FULL">FULL</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Table"
                              value={join.table}
                              onChange={e => {
                                const newJoins = [...joins];
                                newJoins[i] = { ...join, table: e.target.value };
                                setJoins(newJoins);
                              }}
                              className="flex-1"
                            />
                            <Input
                              placeholder="Alias"
                              value={join.alias || ""}
                              onChange={e => {
                                const newJoins = [...joins];
                                newJoins[i] = { ...join, alias: e.target.value };
                                setJoins(newJoins);
                              }}
                              className="w-20"
                            />
                            <Button size="icon" variant="ghost" onClick={() => setJoins(joins.filter((_, idx) => idx !== i))}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Label className="text-xs">ON</Label>
                            <Input
                              placeholder="left.column"
                              value={join.on.leftColumn}
                              onChange={e => {
                                const newJoins = [...joins];
                                newJoins[i] = { ...join, on: { ...join.on, leftColumn: e.target.value } };
                                setJoins(newJoins);
                              }}
                            />
                            <span>=</span>
                            <Input
                              placeholder="right.column"
                              value={join.on.rightColumn}
                              onChange={e => {
                                const newJoins = [...joins];
                                newJoins[i] = { ...join, on: { ...join.on, rightColumn: e.target.value } };
                                setJoins(newJoins);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}

          {(queryType === "SELECT" || queryType === "UPDATE" || queryType === "DELETE") && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Conditions WHERE ({conditions.length})</span>
                  <Button size="sm" variant="outline" onClick={addCondition}>
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-48">
                  <div className="space-y-2">
                    {conditions.map((cond, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        {i > 0 && (
                          <Select
                            value={cond.connector}
                            onValueChange={v => {
                              const newConds = [...conditions];
                              newConds[i] = { ...cond, connector: v as "AND" | "OR" };
                              setConditions(newConds);
                            }}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">AND</SelectItem>
                              <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <Input
                          placeholder="Colonne"
                          value={cond.column}
                          onChange={e => {
                            const newConds = [...conditions];
                            newConds[i] = { ...cond, column: e.target.value };
                            setConditions(newConds);
                          }}
                          className="flex-1"
                        />
                        <Select
                          value={cond.operator}
                          onValueChange={v => {
                            const newConds = [...conditions];
                            newConds[i] = { ...cond, operator: v };
                            setConditions(newConds);
                          }}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map(op => (
                              <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Valeur"
                          value={cond.value}
                          onChange={e => {
                            const newConds = [...conditions];
                            newConds[i] = { ...cond, value: e.target.value };
                            setConditions(newConds);
                          }}
                          className="flex-1"
                          disabled={cond.operator === "IS NULL" || cond.operator === "IS NOT NULL"}
                        />
                        <Button size="icon" variant="ghost" onClick={() => setConditions(conditions.filter((_, idx) => idx !== i))}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {queryType === "SELECT" && (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>ORDER BY</span>
                    <Button size="sm" variant="ghost" onClick={addOrderBy}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {orderBy.map((o, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder="Colonne"
                          value={o.column}
                          onChange={e => {
                            const newOrder = [...orderBy];
                            newOrder[i] = { ...o, column: e.target.value };
                            setOrderBy(newOrder);
                          }}
                        />
                        <Select
                          value={o.direction}
                          onValueChange={v => {
                            const newOrder = [...orderBy];
                            newOrder[i] = { ...o, direction: v as "ASC" | "DESC" };
                            setOrderBy(newOrder);
                          }}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ASC">ASC</SelectItem>
                            <SelectItem value="DESC">DESC</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="icon" variant="ghost" onClick={() => setOrderBy(orderBy.filter((_, idx) => idx !== i))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">LIMIT / OFFSET</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div>
                      <Label className="text-xs">LIMIT</Label>
                      <Input type="number" value={limit} onChange={e => setLimit(parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <Label className="text-xs">OFFSET</Label>
                      <Input type="number" value={offset} onChange={e => setOffset(parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {queryType === "INSERT" && (
            <Card>
              <CardHeader>
                <CardTitle>Données INSERT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Colonnes (séparées par des virgules)</Label>
                  <Input
                    value={insertColumns.join(", ")}
                    onChange={e => setInsertColumns(e.target.value.split(",").map(s => s.trim()))}
                  />
                </div>
                <div>
                  <Label>Valeurs (séparées par des virgules)</Label>
                  <Input
                    value={insertValues.join(", ")}
                    onChange={e => setInsertValues(e.target.value.split(",").map(s => s.trim()))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {queryType === "UPDATE" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>SET ({updateSets.length})</span>
                  <Button size="sm" variant="outline" onClick={() => setUpdateSets([...updateSets, { column: "", value: "" }])}>
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {updateSets.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        placeholder="Colonne"
                        value={s.column}
                        onChange={e => {
                          const newSets = [...updateSets];
                          newSets[i] = { ...s, column: e.target.value };
                          setUpdateSets(newSets);
                        }}
                      />
                      <span className="self-center">=</span>
                      <Input
                        placeholder="Valeur"
                        value={s.value}
                        onChange={e => {
                          const newSets = [...updateSets];
                          newSets[i] = { ...s, value: e.target.value };
                          setUpdateSets(newSets);
                        }}
                      />
                      <Button size="icon" variant="ghost" onClick={() => setUpdateSets(updateSets.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="h-fit sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Requête SQL</span>
              <div className="flex gap-2">
                <Badge variant="outline">{dialect.toUpperCase()}</Badge>
                <Button size="sm" variant="outline" onClick={copyQuery}>
                  <Copy className="h-4 w-4 mr-1" /> Copier
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedQuery}
              readOnly
              className="min-h-[400px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
