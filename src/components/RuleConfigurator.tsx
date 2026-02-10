import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { 
  Save, 
  Trash2, 
  Download, 
  Search, 
  X,
  CalendarIcon,
  ChevronDown,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSavedRules, type DQDimension, type Permission } from "@/contexts/SavedRulesContext";
import { useAuth } from "@/contexts/AuthContext";

const DQ_DIMENSIONS: DQDimension[] = [
  "Accuracy",
  "Completeness",
  "Uniqueness",
  "Consistency",
  "Timeliness",
  "Validity",
];

const DIMENSION_DEFINITIONS: Record<DQDimension, string> = {
  Accuracy: "Correctness of data.",
  Completeness: "No missing data.",
  Consistency: "No contradictions.",
  Timeliness: "Data is up-to-date.",
  Validity: "Correct format and rules.",
  Uniqueness: "No duplicates.",
};

const DIMENSION_COLORS: Record<DQDimension, string> = {
  Accuracy: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Completeness: "bg-green-500/20 text-green-400 border-green-500/30",
  Uniqueness: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Consistency: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Timeliness: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Validity: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const RuleConfigurator = () => {
  const { toast } = useToast();
  const { savedRules, setSavedRules } = useSavedRules();
  const { user } = useAuth();
  
  // Form state
  const [ruleName, setRuleName] = useState("");
  const [dqDimension, setDqDimension] = useState<string>("");
  const [comments, setComments] = useState("");
  const [ruleFormula, setRuleFormula] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [newPermissionName, setNewPermissionName] = useState("");
  const [newPermissionRole, setNewPermissionRole] = useState<"Viewer" | "Editor" | "Executor">("Viewer");

  // Edit mode
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Filter state
  const [searchRuleName, setSearchRuleName] = useState("");
  const [filterDimension, setFilterDimension] = useState<string>("");
  const [filterCreatedBy, setFilterCreatedBy] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedRules, setSelectedRules] = useState<string[]>([]);

  const handleAddPermission = () => {
    if (!newPermissionName.trim()) return;
    
    const exists = permissions.some(
      (p) => p.name.toLowerCase() === newPermissionName.toLowerCase()
    );
    
    if (exists) {
      toast({
        title: "Permission already exists",
        description: "This user/role has already been added.",
        variant: "destructive",
      });
      return;
    }

    setPermissions([...permissions, { name: newPermissionName, role: newPermissionRole }]);
    setNewPermissionName("");
  };

  const handleRemovePermission = (name: string) => {
    setPermissions(permissions.filter((p) => p.name !== name));
  };

  const handleSave = () => {
    if (!ruleName.trim()) {
      toast({
        title: "Rule name required",
        description: "Please enter a rule name.",
        variant: "destructive",
      });
      return;
    }

    if (!dqDimension) {
      toast({
        title: "DQ Dimension required",
        description: "Please select a DQ Dimension.",
        variant: "destructive",
      });
      return;
    }

    if (editingRuleId) {
      setSavedRules((prev) =>
        prev.map((r) =>
          r.id === editingRuleId
            ? {
                ...r,
                ruleName: ruleName.trim(),
                dqDimension: dqDimension as DQDimension,
                comments,
                ruleFormula,
                lastModified: new Date(),
                modifiedBy: user?.name || "Unknown",
                permissions: [...permissions],
                isPublic,
              }
            : r
        )
      );
      toast({
        title: "Rule updated",
        description: `Rule "${ruleName}" has been updated successfully.`,
      });
      setEditingRuleId(null);
    } else {
      const newRule = {
        id: crypto.randomUUID(),
        ruleName: ruleName.trim(),
        dqDimension: dqDimension as DQDimension,
        comments,
        ruleFormula,
        createdBy: user?.name || "Unknown",
        createdOn: new Date(),
        lastModified: new Date(),
        modifiedBy: user?.name || "Unknown",
        status: "Active" as const,
        permissions: [...permissions],
        isPublic,
      };
      setSavedRules((prev) => [newRule, ...prev]);
      toast({
        title: "Rule saved",
        description: `Rule "${ruleName}" has been saved successfully.`,
      });
    }

    handleClear();
  };

  const handleClear = () => {
    setRuleName("");
    setDqDimension("");
    setComments("");
    setRuleFormula("");
    setPermissions([]);
    setIsPublic(false);
    setEditingRuleId(null);
  };

  const handleExport = (fmt: "csv" | "excel" | "json") => {
    const rulesToExport = selectedRules.length > 0
      ? filteredRules.filter((r) => selectedRules.includes(r.id))
      : filteredRules;

    if (rulesToExport.length === 0) {
      toast({ title: "No rules to export", description: "No rules match the current selection/filters.", variant: "destructive" });
      return;
    }

    const exportData = rulesToExport.map((r) => ({
      "Rule Name": r.ruleName,
      "DQ Dimension": r.dqDimension,
      Status: r.status,
      "Created By": r.createdBy,
      "Created On": format(r.createdOn, "yyyy-MM-dd"),
      "Last Modified": format(r.lastModified, "yyyy-MM-dd"),
    }));

    let content: string;
    let mimeType: string;
    let extension: string;

    if (fmt === "json") {
      content = JSON.stringify(exportData, null, 2);
      mimeType = "application/json";
      extension = "json";
    } else if (fmt === "csv" || fmt === "excel") {
      const headers = Object.keys(exportData[0]);
      const csvRows = [
        headers.join(","),
        ...exportData.map((row) =>
          headers.map((h) => `"${(row as any)[h]}"`).join(",")
        ),
      ];
      content = csvRows.join("\n");
      mimeType = fmt === "csv" ? "text/csv" : "application/vnd.ms-excel";
      extension = fmt === "csv" ? "csv" : "xls";
    } else {
      return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rules_export.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: `${rulesToExport.length} rule(s) exported as ${fmt.toUpperCase()}.`,
    });
  };

  const handleDeleteSelected = () => {
    if (selectedRules.length === 0) {
      toast({ title: "No rules selected", description: "Please select rules to delete.", variant: "destructive" });
      return;
    }
    setSavedRules((prev) => prev.filter((r) => !selectedRules.includes(r.id)));
    setSelectedRules([]);
    toast({ title: "Rules deleted", description: `${selectedRules.length} rule(s) deleted.` });
  };

  const handleModifySelected = () => {
    if (selectedRules.length !== 1) {
      toast({ title: "Select one rule", description: "Please select exactly one rule to modify.", variant: "destructive" });
      return;
    }
    const rule = savedRules.find((r) => r.id === selectedRules[0]);
    if (rule) {
      setRuleName(rule.ruleName);
      setDqDimension(rule.dqDimension);
      setComments(rule.comments || "");
      setRuleFormula(rule.ruleFormula || "");
      setPermissions([...rule.permissions]);
      setIsPublic(rule.isPublic);
      setEditingRuleId(rule.id);
      toast({ title: "Rule loaded", description: `"${rule.ruleName}" loaded for editing.` });
    }
  };

  const toggleRuleSelection = (ruleId: string) => {
    setSelectedRules((prev) =>
      prev.includes(ruleId)
        ? prev.filter((id) => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRules.length === filteredRules.length && filteredRules.length > 0) {
      setSelectedRules([]);
    } else {
      setSelectedRules(filteredRules.map((r) => r.id));
    }
  };

  // Filter rules
  const filteredRules = savedRules.filter((rule) => {
    const matchesName = rule.ruleName.toLowerCase().includes(searchRuleName.toLowerCase());
    const matchesDimension = !filterDimension || filterDimension === "all" || rule.dqDimension === filterDimension;
    const matchesCreatedBy = filterCreatedBy === "all" || rule.createdBy === filterCreatedBy;
    const matchesDateFrom = !dateRange.from || rule.createdOn >= dateRange.from;
    const matchesDateTo = !dateRange.to || rule.createdOn <= dateRange.to;
    
    return matchesName && matchesDimension && matchesCreatedBy && matchesDateFrom && matchesDateTo;
  });

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Rule Configurator Form */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {editingRuleId ? "Edit Rule" : "Rule Configurator"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Rule Name - Full Width with Tooltip */}
            <div>
              <Label htmlFor="ruleName">Rule Name</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    id="ruleName"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="Enter rule name"
                    className="mt-1.5"
                  />
                </TooltipTrigger>
                {ruleName && (
                  <TooltipContent side="top">
                    <p>{ruleName}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>

            {/* DQ Dimension with hover definitions via Radix Tooltip */}
            <div>
              <Label>DQ Dimension</Label>
              <Select value={dqDimension} onValueChange={setDqDimension}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {DQ_DIMENSIONS.map((dim) => (
                    <Tooltip key={dim}>
                      <TooltipTrigger asChild>
                        <div>
                          <SelectItem value={dim}>
                            {dim}
                          </SelectItem>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="z-[200]">
                        <p className="text-xs font-medium">{dim}: {DIMENSION_DEFINITIONS[dim]}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Comments / Business Description */}
            <div>
              <Label htmlFor="comments">Comments / Business Description</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter business explanation..."
                className="mt-1.5 min-h-[100px] resize-none"
              />
            </div>

            {/* Rule Check Formula */}
            <div>
              <Label htmlFor="ruleFormula">Rule Check Formula (SQL / Expression)</Label>
              <Textarea
                id="ruleFormula"
                value={ruleFormula}
                onChange={(e) => setRuleFormula(e.target.value)}
                placeholder="SELECT * FROM table WHERE condition..."
                className="mt-1.5 min-h-[120px] resize-none font-mono text-sm bg-secondary/50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                {editingRuleId ? "Update" : "Save"}
              </Button>
              <Button variant="secondary" onClick={handleClear} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* DIV 1: Manage Rules */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Manage Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Search Rule Name */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchRuleName}
                    onChange={(e) => setSearchRuleName(e.target.value)}
                    placeholder="Search Rule Name"
                    className="pl-9"
                    list="rule-names-list"
                  />
                  <datalist id="rule-names-list">
                    {savedRules.map((r) => (
                      <option key={r.id} value={r.ruleName} />
                    ))}
                  </datalist>
                </div>

                {/* DQ Dimension Filter */}
                <Select value={filterDimension} onValueChange={setFilterDimension}>
                  <SelectTrigger>
                    <SelectValue placeholder="DQ Dimension" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dimensions</SelectItem>
                    {DQ_DIMENSIONS.map((dim) => (
                      <SelectItem key={dim} value={dim}>
                        {dim}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Date Range Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Date Range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                      numberOfMonths={2}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {/* Export Button */}
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-32 p-1" align="end">
                      <button
                        onClick={() => handleExport("csv")}
                        className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted rounded"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => handleExport("excel")}
                        className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted rounded"
                      >
                        Excel
                      </button>
                      <button
                        onClick={() => handleExport("json")}
                        className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted rounded"
                      >
                        JSON
                      </button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Action buttons row */}
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleModifySelected}>
                  <Pencil className="w-3.5 h-3.5" />
                  Modify / Edit
                </Button>
                <Button variant="destructive" size="sm" className="gap-1.5" onClick={handleDeleteSelected}>
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* DIV 2: Saved Rules */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Saved Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="max-h-[480px] overflow-y-auto overflow-x-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-secondary/80 backdrop-blur-sm">
                      <TableRow className="bg-secondary/30">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedRules.length === filteredRules.length && filteredRules.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Rule Name</TableHead>
                        <TableHead>DQ Dimension</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created Info</TableHead>
                        <TableHead>Last Modified</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRules.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                            {savedRules.length === 0
                              ? "No rules saved yet. Create a rule using the form on the left."
                              : "No rules found matching the filters."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRules.map((rule) => (
                          <TableRow key={rule.id} className="hover:bg-muted/30">
                            <TableCell>
                              <Checkbox
                                checked={selectedRules.includes(rule.id)}
                                onCheckedChange={() => toggleRuleSelection(rule.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="text-primary hover:underline text-left">
                                    {rule.ruleName}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>{rule.ruleName}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn("text-xs", DIMENSION_COLORS[rule.dqDimension])}
                              >
                                {rule.dqDimension}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={rule.status === "Active" ? "default" : "secondary"}
                                className={cn(
                                  "text-xs",
                                  rule.status === "Active"
                                    ? "bg-success/20 text-success border-success/30"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {rule.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm">{rule.createdBy}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(rule.createdOn, "MMM dd, yyyy")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm">{rule.modifiedBy || rule.createdBy}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(rule.lastModified, "MMM dd, yyyy")}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DIV 3: Manage Access Permission */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Manage Access Permission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newPermissionName}
                  onChange={(e) => setNewPermissionName(e.target.value)}
                  placeholder="Enter user or role name"
                  className="flex-1"
                />
                <Select 
                  value={newPermissionRole} 
                  onValueChange={(val) => setNewPermissionRole(val as "Viewer" | "Editor" | "Executor")}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Executor">Executor</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="secondary" onClick={handleAddPermission}>
                  Grant
                </Button>
              </div>

              {/* Permission chips */}
              {permissions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {permissions.map((perm) => (
                    <Badge
                      key={perm.name}
                      variant="secondary"
                      className="flex items-center gap-1.5 py-1 px-2"
                    >
                      <span>{perm.name}</span>
                      <span className="text-xs text-muted-foreground">({perm.role})</span>
                      <button
                        onClick={() => handleRemovePermission(perm.name)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Make rule public checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                />
                <Label htmlFor="isPublic" className="text-sm font-normal cursor-pointer">
                  Make rule public
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default RuleConfigurator;
