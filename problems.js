// DSA Problems Database
const DSA_PROBLEMS = [
  {
    id: 1,
    title: "Two Sum",
    category: "Arrays",
    difficulty: "Easy",
    description: "Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to target</em>.<br><br>You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "-10⁹ ≤ target ≤ 10⁹", "Only one valid answer exists."],
    tags: ["Array", "Hash Table"],
    hints: ["Think about what complement you need for each number.", "A HashMap can help you look up complements in O(1) time.", "For each number x, check if target-x exists in the map. If not, store x."],
    templates: {
      python: `def twoSum(nums, target):\n    # Your solution here\n    pass\n\n# Test\nprint(twoSum([2,7,11,15], 9))  # Expected: [0,1]`,
      javascript: `function twoSum(nums, target) {\n    // Your solution here\n}\n\n// Test\nconsole.log(twoSum([2,7,11,15], 9)); // Expected: [0,1]`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your solution here\n        return new int[]{};\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your solution here\n        return {};\n    }\n};`,
    },
    solution: {
      python: `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []`,
      complexity: { time: "O(n)", space: "O(n)" }
    }
  },
  {
    id: 2,
    title: "Valid Parentheses",
    category: "Stack",
    difficulty: "Easy",
    description: "Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.<br><br>An input string is valid if: open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: ["1 ≤ s.length ≤ 10⁴", "s consists of parentheses only '()[]{}'"],
    tags: ["String", "Stack"],
    hints: ["Think about what data structure keeps track of the 'most recent' open bracket.", "A stack follows Last-In-First-Out order — perfect for matching brackets!", "Push opening brackets onto the stack. When you see a closing bracket, check if the top of the stack is its match."],
    templates: {
      python: `def isValid(s):\n    # Your solution here\n    pass\n\n# Test\nprint(isValid("()[]{}"))  # Expected: True`,
      javascript: `function isValid(s) {\n    // Your solution here\n}\n\nconsole.log(isValid("()[]{}")); // Expected: true`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Your solution here\n        return false;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        // Your solution here\n        return false;\n    }\n};`,
    },
    solution: {
      python: `def isValid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack`,
      complexity: { time: "O(n)", space: "O(n)" }
    }
  },
  {
    id: 3,
    title: "Merge Two Sorted Lists",
    category: "Linked List",
    difficulty: "Easy",
    description: "You are given the heads of two sorted linked lists <code>list1</code> and <code>list2</code>.<br><br>Merge the two lists in a one <strong>sorted</strong> list. The list should be made by splicing together the nodes of the first two lists.<br><br>Return <em>the head of the merged linked list</em>.",
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
      { input: "list1 = [], list2 = []", output: "[]" },
    ],
    constraints: ["The number of nodes in both lists is in the range [0, 50].", "-100 ≤ Node.val ≤ 100", "Both list1 and list2 are sorted in non-decreasing order."],
    tags: ["Linked List", "Recursion"],
    hints: ["Use a dummy head node to simplify edge cases.", "Compare the current nodes of both lists and attach the smaller one.", "Think about the recursive case: merge(l1, l2) = min(l1, l2) + merge(rest)"],
    templates: {
      python: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef mergeTwoLists(list1, list2):\n    # Your solution here\n    pass`,
      javascript: `function mergeTwoLists(list1, list2) {\n    // Your solution here\n}`,
      java: `class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Your solution here\n        return null;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        // Your solution here\n        return nullptr;\n    }\n};`,
    },
    solution: {
      python: `def mergeTwoLists(list1, list2):\n    dummy = ListNode(0)\n    current = dummy\n    while list1 and list2:\n        if list1.val <= list2.val:\n            current.next = list1\n            list1 = list1.next\n        else:\n            current.next = list2\n            list2 = list2.next\n        current = current.next\n    current.next = list1 or list2\n    return dummy.next`,
      complexity: { time: "O(m+n)", space: "O(1)" }
    }
  },
  {
    id: 4,
    title: "Maximum Subarray",
    category: "Dynamic Programming",
    difficulty: "Medium",
    description: "Given an integer array <code>nums</code>, find the <strong>subarray</strong> with the largest sum, and return <em>its sum</em>.<br><br>A subarray is a contiguous non-empty sequence of elements within an array.",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1" },
      { input: "nums = [5,4,-1,7,8]", output: "23" },
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    hints: ["What if you track the 'current sum' as you scan left to right?", "At each position, decide: extend the existing subarray, or start fresh from here?", "Kadane's Algorithm: currentMax = max(num, currentMax + num). Track globalMax throughout."],
    templates: {
      python: `def maxSubArray(nums):\n    # Your solution here\n    pass\n\nprint(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]))  # Expected: 6`,
      javascript: `function maxSubArray(nums) {\n    // Your solution here\n}\n\nconsole.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // Expected: 6`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        // Your solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Your solution here\n        return 0;\n    }\n};`,
    },
    solution: {
      python: `def maxSubArray(nums):\n    max_sum = current_sum = nums[0]\n    for num in nums[1:]:\n        current_sum = max(num, current_sum + num)\n        max_sum = max(max_sum, current_sum)\n    return max_sum`,
      complexity: { time: "O(n)", space: "O(1)" }
    }
  },
  {
    id: 5,
    title: "Binary Tree Level Order Traversal",
    category: "Trees",
    difficulty: "Medium",
    description: "Given the <code>root</code> of a binary tree, return <em>the level order traversal of its nodes' values</em> (i.e., from left to right, level by level).",
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
      { input: "root = [1]", output: "[[1]]" },
      { input: "root = []", output: "[]" },
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 2000].", "-1000 ≤ Node.val ≤ 1000"],
    tags: ["Tree", "BFS", "Queue"],
    hints: ["Think about using a queue (BFS) to process nodes level by level.", "How do you know when one level ends and the next begins?", "At each step, process ALL nodes in the current queue (that's one level), then add their children."],
    templates: {
      python: `from collections import deque\n\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef levelOrder(root):\n    # Your solution here\n    pass`,
      javascript: `function levelOrder(root) {\n    // Your solution here\n}`,
      java: `class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        // Your solution here\n        return new ArrayList<>();\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        // Your solution here\n        return {};\n    }\n};`,
    },
    solution: {
      python: `def levelOrder(root):\n    if not root:\n        return []\n    result, queue = [], deque([root])\n    while queue:\n        level = []\n        for _ in range(len(queue)):\n            node = queue.popleft()\n            level.append(node.val)\n            if node.left: queue.append(node.left)\n            if node.right: queue.append(node.right)\n        result.append(level)\n    return result`,
      complexity: { time: "O(n)", space: "O(n)" }
    }
  },
  {
    id: 6,
    title: "LRU Cache",
    category: "Design",
    difficulty: "Hard",
    description: "Design a data structure that follows the constraints of a <strong>Least Recently Used (LRU) cache</strong>.<br><br>Implement the <code>LRUCache</code> class:<br>• <code>LRUCache(int capacity)</code> Initialize the LRU cache with positive size capacity.<br>• <code>int get(int key)</code> Return the value of the key if it exists, otherwise return <code>-1</code>.<br>• <code>void put(int key, int value)</code> Update/insert the value. If the number of keys exceeds capacity, evict the least recently used key.",
    examples: [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', output: "[null,null,null,1,null,-1,null,-1,3,4]" },
    ],
    constraints: ["1 ≤ capacity ≤ 3000", "0 ≤ key ≤ 10⁴", "0 ≤ value ≤ 10⁵", "At most 2 * 10⁵ calls will be made to get and put."],
    tags: ["Hash Table", "Linked List", "Design", "Doubly-Linked List"],
    hints: ["You need O(1) for both get and put. What data structures give O(1) lookup and O(1) insertion/deletion?", "A HashMap + Doubly Linked List combination is the classic approach.", "The linked list maintains order (MRU at front, LRU at back). HashMap gives O(1) node access."],
    templates: {
      python: `class LRUCache:\n    def __init__(self, capacity: int):\n        # Initialize your data structure\n        pass\n\n    def get(self, key: int) -> int:\n        # Return value or -1\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        # Insert or update\n        pass`,
      javascript: `class LRUCache {\n    constructor(capacity) {\n        // Initialize\n    }\n\n    get(key) {\n        // Return value or -1\n    }\n\n    put(key, value) {\n        // Insert or update\n    }\n}`,
      java: `class LRUCache {\n    public LRUCache(int capacity) {\n        \n    }\n    \n    public int get(int key) {\n        return -1;\n    }\n    \n    public void put(int key, int value) {\n        \n    }\n}`,
      cpp: `class LRUCache {\npublic:\n    LRUCache(int capacity) {\n        \n    }\n    \n    int get(int key) {\n        return -1;\n    }\n    \n    void put(int key, int value) {\n        \n    }\n};`,
    },
    solution: {
      python: `from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.cache = OrderedDict()\n        self.capacity = capacity\n\n    def get(self, key):\n        if key not in self.cache:\n            return -1\n        self.cache.move_to_end(key)\n        return self.cache[key]\n\n    def put(self, key, value):\n        if key in self.cache:\n            self.cache.move_to_end(key)\n        self.cache[key] = value\n        if len(self.cache) > self.capacity:\n            self.cache.popitem(last=False)`,
      complexity: { time: "O(1) for both operations", space: "O(capacity)" }
    }
  },
  {
    id: 7,
    title: "Climbing Stairs",
    category: "Dynamic Programming",
    difficulty: "Easy",
    description: "You are climbing a staircase. It takes <code>n</code> steps to reach the top.<br><br>Each time you can either climb <code>1</code> or <code>2</code> steps. In how many distinct ways can you climb to the top?",
    examples: [
      { input: "n = 2", output: "2", explanation: "1+1, 2" },
      { input: "n = 3", output: "3", explanation: "1+1+1, 1+2, 2+1" },
    ],
    constraints: ["1 ≤ n ≤ 45"],
    tags: ["Math", "Dynamic Programming", "Memoization"],
    hints: ["Think about the last step. You arrived from step n-1 or step n-2.", "So ways(n) = ways(n-1) + ways(n-2). Sound familiar?", "This is the Fibonacci sequence! Base cases: ways(1)=1, ways(2)=2."],
    templates: {
      python: `def climbStairs(n):\n    # Your solution here\n    pass\n\nprint(climbStairs(5))  # Expected: 8`,
      javascript: `function climbStairs(n) {\n    // Your solution here\n}\n\nconsole.log(climbStairs(5)); // Expected: 8`,
      java: `class Solution {\n    public int climbStairs(int n) {\n        // Your solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        // Your solution here\n        return 0;\n    }\n};`,
    },
    solution: {
      python: `def climbStairs(n):\n    if n <= 2:\n        return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b`,
      complexity: { time: "O(n)", space: "O(1)" }
    }
  },
  {
    id: 8,
    title: "Reverse Linked List",
    category: "Linked List",
    difficulty: "Easy",
    description: "Given the <code>head</code> of a singly linked list, reverse the list, and return <em>the reversed list</em>.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
    ],
    constraints: ["The number of nodes in the list is the range [0, 5000].", "-5000 ≤ Node.val ≤ 5000"],
    tags: ["Linked List", "Recursion"],
    hints: ["You need to change the direction of each pointer.", "Use three pointers: prev, curr, next. At each step, reverse the curr.next pointer.", "After reversing, move all three pointers one step forward."],
    templates: {
      python: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverseList(head):\n    # Your solution here\n    pass`,
      javascript: `function reverseList(head) {\n    // Your solution here\n}`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Your solution here\n        return null;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Your solution here\n        return nullptr;\n    }\n};`,
    },
    solution: {
      python: `def reverseList(head):\n    prev, curr = None, head\n    while curr:\n        next_node = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_node\n    return prev`,
      complexity: { time: "O(n)", space: "O(1)" }
    }
  },
];

const CATEGORIES = [...new Set(DSA_PROBLEMS.map(p => p.category))];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
