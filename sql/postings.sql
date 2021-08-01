INSERT INTO learningCode.postings (id, author, title, main_posting, main_category, created_at) VALUES (25, 28, '객체지향 구현 원리 5가지-SOLID', '1. SRP(Single Responsibility Principle) - 단일 책임의 원리
  클래스는 오직 하나의 일만 수행해야 생산성이 높아진다. 시스템의 모든 객체는 하나의 책임만을 가져야 한다. 객체가 제공하는 모든 기능은 단 하나의 책임을 수행하는데 집중되야 한다.

2. OCP(Open Closed Principle) - 클래스는 기능 확장에 대해서는 열려 있지만, 코드 수정에 대해서는 닫혀있다
  소프트웨어도 예측하기 어려운 변화무쌍한 요구 사항이 발생한다. 요구사항은 기존에 대발된 기능을 수정하거나 새로운 기능을 확장하는 등이 있다. 가장 직관적인 수정 방법은 기존 클래스 안 메서드의 내부 로직을 변경하는 것이다. 하지만 이 방식은 사이드 디펙트가 우려되어 사이드 이펙트 발생 유무도 검사를 해야한다. 따라서 기존 클래스에 대해 수정 사항이 발생하면 기존 클래스를 수정하는 대신 새로운 클래스나 기능을 만들어 확장해야 한다. 이는 상속, 오버라이드, 폴리모피즘으로 구현할 수 있다. 
3. LSP(Liskov Substitution Principle) - 자식 클래스는 부모 클래스가 사용되는 곳(이 클래스 그룹을 사용하는 다른 클래스)에 대처될 수 있어야 한다.

  이는 상속, 폴리모피즘을 깔끔하게 적용하고 싶을때 곱씹어야 할 원칙이다. 클라이언트가 부모 클래스에만 의존하고 자식 클래스는 의존하지 않는다. 클라이언트를 실행하는 실행 클래스에서 클라이언트 객체를 생성한다. 이때 실생 클래스는 클라이언트 클래스에게 오른쪽 부모 클래스의 자식 클래스를 넘겨주는 구조로 폴리모피즘을 구현한다.
여기서 중요한것은 클라이언트 클래스는 부모 클래스만 의존하기 때문에 부모 클래스의 인터페이스만 알 수 있다는 것이다. 만약 자식 클래스가 새롭게 추가되었다 해도 클라이언트 클래스는 새로운 자식 클래스를 알 필요가 없다.

  상속의 경우 자식 타입들은 부모 타입들이 사용되는 곳은 온전히 대처할 수 있다는 LSP규칙을 지킬 수 있다면 사용한다. 단순 위임의 경우 클라이언트 클래스가 다른 클래스의 기능을 사용하지만 그 기능을 변경할 필요가 없을 때 사용한다. 위임은 단순 위임을 해주고 있는 클래스의 기능을 다른 기능으로 교체할 수도 있는 요구사항이 있을 때는 자식 클래스를 교체할 수 있는 위임을 쓴다.

4. ISP(Interface Segregation Principle) - 인터페이스 관점에서 클래스는 자신이 사용하지 않는 메서드에 의존하면 안된다

  자식 클래스는 쓰지 않는 인터페이스를 억지로 상속받게 되면, 상위 부모 인터페이스를 분리해야 한다. 자식 클래스는 쓰지도 않는 부모 클래스의 메서드가 변경 되었을 때 자식 클래스도 영향을 받기 때문이다. 

5.1 DRY(Don''t Repeat Yourself) - 공통되는 부분을 추출하여 추상화하고 한곳에 두어 중복 코드를 피하라

  만약 어떤 코드나 기능이 소프트웨어 내에서 분명하고 유일하고 유일한 주체성을 가진 다면, 같은 내뇽의 코드가 다른 클래스에 존재해서는 안된다. 만약 중복된다면 다음과 같은 문제가 발생한다.

  1. 이 코드를 사용하는 클라이언트 클래스들은 어느 코드를 사용해야 할지 혼란스럽다

  2. 만약 개발자가 이 중복된 코드를 동시에 관리하지 못하고 하나의 코드암 관리한다면, 다른 중복된 코드는 추가 요구사항을 반영하지 못하고 이전 코드로 암게 되는 경우가 발생한다.

  3. 그렇다면 두 코드를 사용하는 클라이언트 클래스 중 일부는 잘못된 코드를 사용하기 때문에 조만간 버그가 발생한다. 

5.2 DIP(Dependency Inversion principle) - 의존 관계 역전, 구체적인 클래스 대신 추상적인 클래스에 의존하라

  이는 폴리모피즘에서 언급한 클라이언트 클래스에서는 부모 클래스만 의존하고 자식 클래스를 인자로 넘겨 받아야 한다는 원칙과 동일하다
', '자유게시판', '2021-05-29 02:47:53');
INSERT INTO learningCode.postings (id, author, title, main_posting, main_category, created_at) VALUES (38, 29, 'boj 1967', '#include <iostream>
#include <cstring>
#include <vector>
using namespace std;

const int MAX = 1e4 + 5;
struct Tree{
	int node;
	int cost;
};
int nodes, leaf_node, max_cost = -1;
bool visited[MAX];
vector<vector<Tree>> tree(MAX);

void findTreeDiameter(int curr_node, int curr_cost){
	visited[curr_node] = true;
	if(curr_cost > max_cost){
		max_cost = curr_cost;
		leaf_node = curr_node;
	}
	for(int n = 0; n < tree[curr_node].size(); n++){
		Tree next = tree[curr_node][n];
		if(visited[next.node]) continue;
		findTreeDiameter(next.node, curr_cost + next.cost);
	}
}

int main(void){
	ios_base::sync_with_stdio(false);
	cin.tie(NULL);
	cin >> nodes;
	int parent;
	Tree tmp;
	for(int n = 1; n < nodes; n++){
		cin >> parent >> tmp.node >> tmp.cost;
		tree[parent].push_back(tmp);
		tree[tmp.node].push_back({parent, tmp.cost});
	}	
	findTreeDiameter(1, 0);	
	memset(visited, false, sizeof(visited));
	findTreeDiameter(leaf_node, 0);
	cout << max_cost;
}
', '알고리즘', '2021-05-29 05:01:18');
INSERT INTO learningCode.postings (id, author, title, main_posting, main_category, created_at) VALUES (40, 37, '울산 친구들 구합니다.', '구해요', '스터디', '2021-05-29 13:10:26');
INSERT INTO learningCode.postings (id, author, title, main_posting, main_category, created_at) VALUES (41, 38, '선생님들 프로그래밍 너무 어려워요', 'ㅠㅠㅠㅠㅠㅠㅠㅠㅠ', '자유게시판', '2021-05-29 13:16:53');
INSERT INTO learningCode.postings (id, author, title, main_posting, main_category, created_at) VALUES (42, 39, '백준 스터디 지망생~', '개발 잘하고싶어요.. 가르쳐주세요~~', '스터디', '2021-05-30 22:51:40');
INSERT INTO learningCode.postings (id, author, title, main_posting, main_category, created_at) VALUES (43, 39, 'test', 'ㅍㅍㅍ', '자유게시판', '2021-05-31 14:02:43');
INSERT INTO learningCode.postings (id, author, title, main_posting, main_category, created_at) VALUES (49, 41, '코딩잘하는방법좀요', '제발....', '코딩질문', '2021-05-31 14:37:25');
INSERT INTO learningCode.postings (id, author, title, main_posting, main_category, created_at) VALUES (51, 44, '취업성공1234', 'ssssssssssssssssssssssssdddddddddddddddddddddddddsssssssssssssssssssssss', '코딩질문', '2021-05-31 14:58:44');
INSERT INTO learningCode.postings (id, author, title, main_posting, main_category, created_at) VALUES (52, 45, '안녕하세요~', '안녕하세요~ 저는 천재입니다 다들 머리를 조아리세요', '자유게시판', '2021-06-01 12:38:29');
INSERT INTO learningCode.postings (id, author, title, main_posting, main_category, created_at) VALUES (54, 46, 'test12345', '안녕하세요~ 가입인사 겸 글 써봅니다^^', '자유게시판', '2021-06-02 01:56:24');
INSERT INTO learningCode.postings (id, author, title, main_posting, main_category, created_at) VALUES (73, 46, 'test111111', 'testest 글 작성', '자유게시판', '2021-06-06 09:10:31');