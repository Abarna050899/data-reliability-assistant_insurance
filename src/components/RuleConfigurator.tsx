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
import { Calendar } from "@/components/ui/calendar";
import { 
  Save, 
  Trash2, 
  Download, 
  Search, 
  X,
  CalendarIcon,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const DQ_DIMENSIONS = [
  "Accuracy",
  "Completeness",
  "Uniqueness",
  "Consistency",
  "Timeliness",
  "Validity",
] as const;

type DQDimension = typeof DQ_DIMENSIONS[number];

interface Permission {
  name: string;
  role: "Viewer" | "Editor" | "Executor";
}

interface SavedRule {
  id: string;
  ruleName: string;
  dqDimension: DQDimension;
  createdBy: string;
  createdOn: Date;
  status: "Active" | "Draft";
}

const DIMENSION_COLORS: Record<DQDimension, string> = {
  Accuracy: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Completeness: "bg-green-500/20 text-green-400 border-green-500/30",
  Uniqueness: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Consistency: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Timeliness: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Validity: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const MOCK_SAVED_RULES: SavedRule[] = [
  {
    id: "1",
    ruleName: "Email Format Validation",
    dqDimension: "Validity",
    createdBy: "John Doe",
    createdOn: new Date("2024-01-15"),
    status: "Active",
  },
  {
    id: "2",
    ruleName: "Null Check - Customer ID",
    dqDimension: "Completeness",
    createdBy: "Jane Smith",
    createdOn: new Date("2024-01-20"),
    status: "Active",
  },
  {
    id: "3",
    ruleName: "Duplicate Detection - Phone",
    dqDimension: "Uniqueness",
    createdBy: "Admin",
    createdOn: new Date("2024-02-01"),
    status: "Draft",
  },
  {
    id: "4",
    ruleName: "Date Range Consistency",
    dqDimension: "Consistency",
    createdBy: "John Doe",
    createdOn: new Date("2024-02-05"),
    status: "Active",
  },
];

const MOCK_USERS = ["John Doe", "Jane Smith", "Admin", "Data Team"];

const RuleConfigurator = () => {
  const { toast } = useToast();
  
  // Form state
  const [ruleName, setRuleName] = useState("");
  const [dqDimension, setDqDimension] = useState<string>("");
  const [comments, setComments] = useState("");
  const [ruleFormula, setRuleFormula] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [newPermissionName, setNewPermissionName] = useState("");
  const [newPermissionRole, setNewPermissionRole] = useState<"Viewer" | "Editor" | "Executor">("Viewer");

  // Filter state
  const [searchRuleName, setSearchRuleName] = useState("");
  const [filterDimension, setFilterDimension] = useState<string>("");
  const [filterCreatedBy, setFilterCreatedBy] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedRules, setSelectedRules] = useState<string[]>([]);

  // Saved rules
  const [savedRules] = useState<SavedRule[]>(MOCK_SAVED_RULES);

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

    toast({
      title: "Rule saved",
      description: `Rule "${ruleName}" has been saved successfully.`,
    });

    handleClear();
  };

  const handleClear = () => {
    setRuleName("");
    setDqDimension("");
    setComments("");
    setRuleFormula("");
    setPermissions([]);
    setIsPublic(false);
  };

  const handleExport = (format: "csv" | "excel" | "json") => {
    toast({
      title: "Export initiated",
      description: `Exporting rules as ${format.toUpperCase()}...`,
    });
  };

  const toggleRuleSelection = (ruleId: string) => {
    setSelectedRules((prev) =>
      prev.includes(ruleId)
        ? prev.filter((id) => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRules.length === filteredRules.length) {
      setSelectedRules([]);
    } else {
      setSelectedRules(filteredRules.map((r) => r.id));
    }
  };

  // Filter rules
  const filteredRules = savedRules.filter((rule) => {
    const matchesName = rule.ruleName.toLowerCase().includes(searchRuleName.toLowerCase());
    const matchesDimension = !filterDimension || rule.dqDimension === filterDimension;
    const matchesCreatedBy = filterCreatedBy === "all" || rule.createdBy === filterCreatedBy;
    const matchesDateFrom = !dateRange.from || rule.createdOn >= dateRange.from;
    const matchesDateTo = !dateRange.to || rule.createdOn <= dateRange.to;
    
    return matchesName && matchesDimension && matchesCreatedBy && matchesDateFrom && matchesDateTo;
  });

  // Get unique creators for filter
  const uniqueCreators = Array.from(new Set(savedRules.map((r) => r.createdBy)));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Rule Configurator Form */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Rule Configurator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Rule Name */}
          <div className="w-1/2">
            <Label htmlFor="ruleName">Rule Name</Label>
            <Input
              id="ruleName"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="Enter rule name"
              className="mt-1.5"
            />
          </div>

          {/* DQ Dimension */}
          <div>
            <Label>DQ Dimension</Label>
            <Select value={dqDimension} onValueChange={setDqDimension}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {DQ_DIMENSIONS.map((dim) => (
                  <SelectItem key={dim} value={dim}>
                    {dim}
                  </SelectItem>
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

          {/* Permission for Other Users */}
          <div className="space-y-3">
            <Label>Permission for Other Users</Label>
            
            {/* Add permission controls */}
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
                Add
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
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
            <Button variant="secondary" onClick={handleClear} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - Saved Rules */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Saved Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="space-y-3 p-4 bg-secondary/30 rounded-lg border border-border">
            <p className="text-sm font-medium text-muted-foreground">Rule Filters</p>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Search Rule Name */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchRuleName}
                  onChange={(e) => setSearchRuleName(e.target.value)}
                  placeholder="Search Rule Name"
                  className="pl-9"
                />
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

              {/* Created By Filter */}
              <Select value={filterCreatedBy} onValueChange={setFilterCreatedBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Created By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {uniqueCreators.map((creator) => (
                    <SelectItem key={creator} value={creator}>
                      {creator}
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
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
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

          {/* Saved Rules Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRules.length === filteredRules.length && filteredRules.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>DQ Dimension</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No rules found matching the filters.
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
                        <button className="text-primary hover:underline text-left">
                          {rule.ruleName}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", DIMENSION_COLORS[rule.dqDimension])}
                        >
                          {rule.dqDimension}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {rule.createdBy}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(rule.createdOn, "MMM dd, yyyy")}
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RuleConfigurator;
