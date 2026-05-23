// 四级考试题目数据（迁移自demo.html，字段已映射）
const questionBank = {
  set1: {
    wordFilling: {
      id: 1,
      type: "wordFilling",
      passage: `A team of researchers led by Priyanka Joshi examined the degree to which men and women relied on "communicative abstraction" to verbally convey their ideas and emotions. Communicative abstraction, according to the researchers, reflects the tendency of people to use "abstract speech that focuses on the broader picture and ___26___ ultimate purpose of action rather than concrete speech focusing on details and the means of ___27___ attaining action." Interestingly, they found that men were far more likely to speak in the abstract than were women.

To arrive at this ___28___ conclusion, the researchers examined the linguistic (语言的) patterns of men and women in over 600, 000 blog posts written on websites. To do this, the researchers computed abstractness ratings for ___29___ approximately 40, 000 commonly used words in the English language. Words considered to be concrete could be easily visualized, such as "table" or "chair". Words that were more ___30___ difficult to visualize, for example, "justice" or "morality," were considered to be more abstract. They found that men used ___31___ significantly more abstract language in their blog posts.

What is the ___32___ source of this effect? The researchers suggest that power differences between the genders—that is, men having more power in society—might be a key determinant. For instance, in a follow-up study conducted with a sample of 300 students, the researchers ___33___ manipulated power dynamics in an interpersonal setting to see if this would influence communicative abstraction. They found that participants in a high-power interviewer role were more likely to give abstract descriptions of behaviors than were participants in a low-power interviewee role. This suggests that communicating more abstractly does not reflect a ___34___ fixed tendency of men or women but rather ___35___ signals within specific contexts.
`,
      wordBank: [
        "approximately",
        "approved",
        "bond",
        "classified",
        "clearing",
        "come",
        "daily",
        "definitely",
        "inactive",
        "recommended",
        "reaping",
        "signals",
        "significantly",
        "source",
        "ultimate",
      ],
      blanks: [
        { position: 1, answer: "O" },
        { position: 2, answer: "B" },
        { position: 3, answer: "C" },
        { position: 4, answer: "A" },
        { position: 5, answer: "D" },
        { position: 6, answer: "M" },
        { position: 7, answer: "N" },
        { position: 8, answer: "I" },
        { position: 9, answer: "F" },
        { position: 10, answer: "E" },
      ],
    },
    paragraphMatching: {
      id: 2,
      type: "paragraphMatching",
      passage: ` A.Hal  Hershfield,a  psychologist  at  the  UCLA  Anderson  School  of  Management,wanted  to  know why  people  weren't  saving  for  retirement.Across  the  board,people  are  living  longer.Logically, they'll  need  more  money  to  live  comfortably  in  their  post-work  years.And  yet,savings  rates  in the  U.S.have  gone   down  in  recent   decades,not  up.B.To  help  explain  this  seemingly  irrational  behavior,Hershfield  and  his  team  scanned  the  brains  of study  participants  while  asking  them  to  what  degree  various  traits(特征)—like    “honorable”or  “funny”—applied   to   their   current    self,their   future   self,a    current   other,or    a   future   other.As participants    answered,Hershfield's     team    recorded    which     parts    of    their     brains    lit     up. Unsurprisingly,people's  brains  were  most  active  when  thinking  about  their  current  selves  and least   active   when   thinking   about   a   current   other.But   the   team   found   that   participants'brain activity  while  considering  their   future  selves  more   closely  resembled  their  brain   activity  while thinking  about  a  current  other  rather  than  the  current  self.C.Put  in  practical  terms,when  thinking   of  yourself  in   a  month   or  a  year   or  a  decade,your  brain registers  that  person   in  ways  similar  to  how  it  would  register  Taylor  Swift  or  the  mailman. Understood   in   that   way,saving   for   retirement   is   the   equivalent   of   giving   money   away   to someone  else  entirely.D.In   light   of  Hershfield's   study,one   simple   question   arises:Is   it   possible   to   make   our   present selves  give  a  damn  about  our  future  selves?The  answers  are  anything  but  simple.E.Seen  through  the  lens  of  the  present   self  versus  the   future  self,our  self-defeating  actions—like choosing  to watch  television rather than  go  to  the  gym—suddenly  make  perfect  sense.We  get  to enjoy   the   very   concrete,immediate   benefits   of   our   actions   while    someone   else(namely,ourr future   selves)suffers    the   hypothetical(假设的),far-off   consequences.As   a   result,the   decisions we make for our present selves often look very different from our decisions for our future selves.We  believe  that  tomorrow  will  be  different.We  believe  that  we  will  be  different  tomorrow;but in  doing  so,we  prioritize  our  current  mood  over  the  consequences  of  our  inaction  for  the  future self.F.Understanding our procrastination( 拖 延 ) through  the  lens  of  the    present   and   future  selves,  we're  left with three possible  solutions:The  first  is  to  force  your  future  self to  do  whatever  your present  self doesn't  want  to  do.The  second  is  to  convince  your  present  self that  your  future  self is,in  fact,still  you.If  the  central  problem  is  that  we  think  of  our  future  selves  as  other  people, it  follows  that  trying  to  identify  more  closely  with  our  future  selves  will  encourage  us  to  make better  long-term  decisions.G.In  a  follow-up  study,Hershfield  wanted  to  explore  ways  to  bridge  the  disconnect  between  the present  and  future  selves  and  encourage  people  to   save  more   for  retirement.He   and  his  team took  photos   of  study  participants,and   then   used  image  processing   to  visually  age  their  faces. Participants were then placed in  a virtual reality  setting where  they  could  look into  a mirror  and see  their  aged  selves  looking  back  at  them.Participants  who  saw  their  aged  selves  said  they would  save  30%more  of  their  salary  for  retirement  than  the  control  group.H.Whatever your long-term goals may be—getting in better shape,launching your own business,writing a book—thinking about your deadline in terms of days rather than months or years can help you wrap your mind around how close the  future really is.I.The  third  solution  is  to  forget  about  your  future  self  and  use  your  present  self's  love  of  instant gratification     (满足感)to  your  advantage.While  the  two  tactics(手段)above can be effective in making   better   long-term   choices,in   the   end,you're   still   struggling   against   human   nature.Our brains  are  hard-wired  for  instant  gratification.Instead  of  fighting   your  present  self's  need  for immediate  rewards,why  not  use  it  to  your  advantage?When  most  of  us   set  goals,we  focus  on long-term  results  we  want  to   see—e.g.,losing  weight,getting   a  promotion,retiring   in   comfort, etc.While those visions  of our  future  selves  can  be  inspiring,when  it  comes  to  actually  doing the day-to-day  work,it  may  be  more  effective  to  reframe  activities  in  terms  of their  immediate,or  at least    very    near-term,rewards.J.Take  writing  this  article,for  instance.It's  easy  for  me  to  imagine  how  amazing  it  will  feel  at  the end   of  the   workday   to   have   this   article   done.This   isn't  just   my   opinion.Research   partners Kaitlin  Woolley  of  Cornell  University  and  Ayelet  Fishbach  of  the  University  of  Chicago  have made a career out of studying the differences between the goals that people achieve and the ones that  fall by  the wayside.K.“In  one  study,we  asked  people  online  about  the  goals  they  set  at  the  beginning  of the  year.Most people    set    goals    to    achieve    delayed,long-term    benefits,such    as    career    advancement,debt repayment,or  improved  health.We  asked  these  individuals  how  enjoyable  it  was  to  pursue  their goal,as well  as  how  important  their  goal  was.We  also  asked  whether  they  were  still  working  on their  goals  two  months  after  setting  them.We  found  that  enjoyment  predicted  people's  goal persistence  two  months  after  setting  the  goal  far  more  than  how  important  they  rated  their  goal to   be,”Woolley   said. L.This  pattern  held  true  across  a  wide  variety  of  goals   from   exercising   to   studying   to  eating healthier  foods.For  example,people  ate   50%more  of  a  healthy  food  when  directed  to  focus  on the  good  taste  rather  than  the  long-term  health  benefits.Other  studies  have  shown  a  greater uptake of exercise in people who were told to think of the enjoyment of doing the exercise now rather  than  future  health  gains.M.These  findings  suggest  that  when  it  comes  to  achieving  your  goals,enjoying  the  process  itself  is  more  important  than  wanting  the  long-term  benefits.In  other  words,present  self  trumps(战胜) future  self.Who  says  instant  gratification  has  to  be  a  bad  thing?By  all  means,set  ambitious  long-term  goals  for  your  future  self,but  when  it  comes  to  actually  following  through  day-to-  day,make  sure  your  present  self  knows  what's  in  it  for  her  too.`,
      sentences: [
        {
          text: "36.Our  brains  are  genetically  determined  to   satisfy  immediate  desires.",
          answer: "I",
        },
        {
          text: "37.Taken  in  a  practical  way,saving  for  post-work  years  is  like  giving  money  away  to  others.",
          answer: "C",
        },
        {
          text: "38.Research  found  that,as  regards  achievement  of  one's  goals,it  is  important  to  focus  more  on enjoying  the  process  than  the  long-term  benefits.",
          answer: "M",
        },
        {
          text: "39.Regarding  our  future  selves  as  still  being  ourselves  will  help  us  make  better  long-term  decisions.",
          answer: "F",
        },
        {
          text: "40.Savings rates in America have dropped in recent decades even though people's life expectancy has increased.",
          answer: "A",
        },
        {
          text: "41.Researchers  found  that  enjoyment  rather  than  importance  enabled  people  to  persist  in  their  goals.",
          answer: "K",
        },
        {
          text: "42.When  making  decisions,we  give  priority  to  our  current  frame  of mind  without  thinking  much  of the  consequences.",
          answer: "E",
        },
        {
          text: "43.People  ate  more  of  a  healthy  food  when  they  focused  on  its  good  taste  instead  of  its  long-term benefits.",
          answer: "L",
        },
        {
          text: "44.As  was   expected,when   people   thought   of  their   present   selves,their   brains   were   observed   to become more  active.",
          answer: "B",
        },
        {
          text: "45.Researchers found that participants who  saw the images  of their aged  selves would  save more  for their  later  years  than  those  who  didn't.",
          answer: "G",
        },
      ],
    },
    readingComprehension: [
      {
        id: 3,
        type: "readingComprehension",
        article:
          "People  often  wonder  why  some  entrepreneurs  have  greater  success  than  others.Is  it  habits, connections,luck,work   ethic   or   any   other   behavior?I   believe   the   key   to    success   is   willpower. Willpower  is  the  ability  to  control  yourself.It  is  a  strong  determination  that  allows  you  to  do something  difficult.It  is  a  behavior  we  are  born  with  more  than  one  we  learn;however,it  is  possible to  not  only  learn  it,but  also  strengthen  it  with  constant  exercise. Willpower  is just  like  a  muscle;to  keep  it  strong  you  need  to  constantly  exercise  it.People  with a  great  amount  of  willpower  have  the  discipline  to  develop  positive,successful  habits.Even  with  an incredible  amount  of  talent,without  the  discipline  and  motivation  to  create  positive  habits,it  can  be difficult to  achieve  success.Willpower  and  habits  go  hand  in  hand.It  is  critical  to  create  good  habits  and  take  the  actions necessary  to  stick  to  those  habits  day  in  and  day  out  for  greater  success.Almost  half  of  our  daily actions  are  part   of  our  habits   and  not   decisions,so   once  the  correct  habits   are  in  place,you   will automatically  perform  those  tasks  on  a  day-to-day  basis.The best way  to  create  and  stick  to  a  habit  is  to  have  a  strong  motivation.It's  easier  to  change your habits to lose weight if you have  a health issue and you want to be around longer for your kids, or  if your  business  is  something  you're  passionate  about.Having  a  valuable  outcome  associated  witha habit will help you  stick  to  that  habit  permanently.The   art   of   self-control   is   one   that   most   successful   individuals   have   mastered.Self-control enables you to  avoid  behaviors that  don't  contribute  to  your  success  and  adopt  those  that  do.Because  there  is  a  delayed  satisfaction  associated  with   self-control,it  can  be   easy  to   get  off track.However,if you  work  on  sticking  to  those  small  positive  habits  one  day  at  a  time,it  becomes easier to  stay  strong  and  achieve  that  delayed  reward.Once  a  reward  is  achieved,it  is  much  easier  to continue  sticking  to  your  habits.",
        questions: [
          {
            question:
              "46.What  does  the  author  say  we  need  to  do  to  strengthen  our  willpower?",
            options: [
              "A. Keep  it  under  control.  ",
              "B. Learn    from    entrepreneurs.",
              "C. Apply   it    continuously. ",
              "D. Aim   at   success   determinedly.",
            ],
            answer: "B",
          },
          {
            question:
              "47.How  are  almost  half of our  daily  actions  performed  according  to  the  passage?",
            options: [
              "A.Out   of   habit. ",
              "B.With     determination. ",
              "C.Like   muscle   building.",
              " D.By     self-discipline.",
            ],
            answer: "A",
          },
          {
            question:
              "48.What  will  help  people  stick  to  doing  something  constructive  automatically?",
            options: [
              "A. Practising  it  on   a  day-to-day  basis.",
              "B. Associating  it  with  improving  health.",
              "C. Possessing  a  reasonable  amount  of  talent.",
              "D. Foreseeing  the  desired  outcome  it  will  yield.",
            ],
            answer: "D",
          },
          {
            question:
              "49.How  does  the  art  of  self-control  help  us  succeed?",
            options: [
              "A. By  allowing  us  to  remain  clear-headed  permanently.",
              "B. By  enabling  us  to  alter  our  behaviors  constantly.",
              "C. By  enabling  us  to  take  positive  actions.",
              "D. By  allowing  us  to  avoid  taking  risks.",
            ],
            answer: "C",
          },
          {
            question:
              "50.Why  can  it  be  difficult  for  us  to  maintain  self-control?",
            options: [
              "A. Most  of us  are  not  in  the  habit  of  exercising  self-control.",
              "B. We  may  not  get  immediate  rewards  from  self-control.",
              "C. Self-control  tends  to  be  associated  with  pains.",
              "D. Self-control  only  brings  about  small  benefits.",
            ],
            answer: "B",
          },
        ],
      },
      {
        id: 4,
        type: "readingComprehension",
        article:
          "Today,most  scientific  research  is  funded  by  government  grants,companies  doing  research  and development,and   non-profit   foundations.As   a   society,we   reap   the   rewards   from   this   science,but we  also  help  pay  for  it.You  indirectly  support  science  through  taxes  you  pay,products  and  services you  purchase,and  donations  you  make.Funding  for  science  has  changed  with  the  times.Historically,science  has  been  largely  supported through   private   patronage(资助),church   sponsorship,or   simply  paying   for  the  research  yourself. Today,researchers  are  likely  to  be   funded  by   a  mix   of  grants  from  various  government   agencies, institutions,and    foundations.Other     research    is     funded     by    private     companies.Such     corporate sponsorship  is  widespread  in  some  fields.Almost  75%of  U.S.clinical  trials  in  medicine  are  paid  for by  private  companies.And,of  course,some   researchers   today   still   fund  small-scale   studies  out  of their   own    pockets.Most   of   us    can't    afford   to    do   nuclear    research   as    a    private   hobby,but birdwatchers,rock  collectors,and  others  can  do  real  research  on  a  limited  budget.In  a  perfect  world,money  wouldn't  matter—all  scientific  studies  would  be  completely  objective.But  in  the  real  world,funding  may  introduce  biases.Drug  research  sponsored  by  the  pharmaceutical(制药的) industry  is  more  likely  to  end  up  favoring  the  drug  under  consideration  than  studies sponsored  by   government   grants   or   charitable   organizations.Similarly,nutrition   research   sponsored by   the   food   industry   is   more   likely   to    end   up   favoring   the    food   under   consideration   than independently  funded  research.So  what  should  we  make  of  all  this?Should  we  ignore  any  research  funded  by  companies  orr special    interest    groups?Certainly    not.These    groups    provide    invaluable    funding    for    scientific research.Furthermore,science  has  many  safeguards  in  place  to  catch  instances  of  bias  that   affect research   outcomes.Ultimately,misleading   results    will   be    corrected   as    science   proceeds;however, this  process  takes  time.Meanwhile,it  pays  to  examine  studies  funded  by  industry  or  special  interest groups  with  extra  care.Are  the  results  consistent  with  other  independently  funded   studies?What  do other  scientists  have   to  say  about  this  research?A   little  examination  can  go  a  long  way   towards identifying  bias  associated  with  the  funding  source.",
        questions: [
          {
            question:
              "51.What  does  the  passage  mainly  discuss  regarding  scientific  research?",
            options: [
              "A. Its     foundation. ",
              "B. Its     prospect.",
              "C. Its     rewards.",
              "D. Its     funding.",
            ],
            answer: "D",
          },
          {
            question:
              "52.What  do  we  learn  from  the  passage  about  researchers  like  birdwatchers  and  rock  collectors?",
            options: [
              "A. They  have   little  access  to   government  funding.",
              "B. They  can  do  research  with  limited  resources.",
              "C. They  can  do  amateur  work  in  their  own  fields.",
              "D. They  have  no  means  for  large-scale  research.",
            ],
            answer: "B",
          },
          {
            question:
              "53.What  would  scientific  studies  look  like  in  a  perfect  world  according  to  the  author?",
            options: [
              "A. They  would  be  totally  unbiased.",
              "B. They  would  be  independently  funded.",
              "C. They  would  be  responsibly  conducted.",
              "D. They  would  be  strictly  supervised.",
            ],
            answer: "A",
          },
          {
            question:
              "54.What  does  the  author  say  about  companies  and  special  interest  groups?",
            options: [
              "A. They  try  hard  to  pull  down  the  safeguards  for  research.",
              "B. They  make  extra  efforts  to  research  their  own  products.",
              "C. They  provide  valuable  resources  for  scientific  research.",
              "D. They  reap  the  most  benefits  from   scientific  research.",
            ],
            answer: "C",
          },
          {
            question:
              "55.What  does  the  author  think  of  research  funded  by  industry  or  special  interest  groups?",
            options: [
              "A. They  try  hard  to  pull  down  the  safeguards  for  research.",
              "B. They  make  extra  efforts  to  research  their  own  products.",
              "C. They  provide  valuable  resources  for  scientific  research.",
              "D. They  reap  the  most  benefits  from   scientific  research.",
            ],
            answer: "C",
          },
        ],
      },
    ],
    translation: {
      id: 5,
      type: "translation",
      chinese:
        "四合院 (siheyuan)   是中国一种传统的住宅建筑，其特点是房屋建造在一个院子的四周，将院子 合围在中间。四合院通常冬暖夏凉，环境舒适，尤其适合大家庭居住。四合院在中国各地有多种类 型，其中以北京的四合院最为典型。如今，随着现代城市的发展，传统的四合院已逐渐减少，但因其独 特的建筑风格，四合院对中国文化的传承和中国历史的研究具有重要意义。",
      reference:
        "Traditional Chinese culture still plays an important role in modern society. For example, the Spring Festival, as the most important traditional festival in China, is not only a time for family reunion but also an important carrier for inheriting Chinese culture.",
    },
    writing: {
      id: 6,
      type: "writing",
      topic:
        "Suppose   your   university    is   seeking    students'opinions    on   whether    university   sports facilities  should  be  open  to  the  public.You  are  now  to  write  an  essay  to  express  your  view.You  will  have  30  minutes for  the  task.You  should  write  at  least  120  words  but  no  more than 180  words.",
      tips: "作文",
    },
  },
  set2: {
    wordFilling: {
      id: 7,
      type: "wordFilling",
      passage: `Over the coming decades, millions of jobs will be threatened by robotics and artificial intelligence. Despite intensive academic ___26___ debate on these developments, there has been little study on how workers ___27___ react to being replaced through technology.

To find out, business researchers at TUM and Erasmus University Rotterdam conducted 11 studies and surveys with over 2,000 persons from several countries.

The findings show: In principle, most people view it more ___28___ favorably when workers are replaced by other people than by robots or intelligent software. This preference ___29___ reverses, however, when it refers to people's own jobs. When that is the case, the majority of workers find it less upsetting to see their own jobs go to robots than to other employees. In the long term, however, the same people see machines as more threatening to their future role in the workforce. These effects can also be observed among people who have recently become unemployed.

The researchers were able to identify the causes behind these ___30___ seemingly paradoxical results, too: People tend to ___31___ compare themselves less with machines than with other people. Consequently, being replaced by a robot or software ___32___ poses less of a threat to their feeling of self-worth. This reduced self-threat could even be observed when participants assumed that they were being replaced by other employees who relied on technological abilities such as artificial intelligence in their work.

"Even when unemployment results from the ___33___ introduction of new technologies, people still judge it in a social context," says Christoph Fuchs, one of the authors of the study. "It is important to understand these ___34___ psychological effects when trying to manage the massive changes in the working world to minimize ___35___ disruptions in society.`,
      wordBank: [
        "compare",
        "contradicts",
        "debate",
        "disruptions",
        "favorably",
        "drastically",
        "guarantee",
        "introduction",
        "modifications",
        "poses",
        "react",
        "psychological",
        "reverses",
        "seemingly",
        "traditional",
      ],
      blanks: [
        { position: 1, answer: "D" }, // a
        { position: 2, answer: "M" }, // the
        { position: 3, answer: "G" }, // for example
        { position: 4, answer: "N" }, // our
        { position: 5, answer: "O" }, // a
        { position: 6, answer: "A" }, // their
        { position: 7, answer: "K" }, // its
        { position: 8, answer: "I" }, // his
        { position: 9, answer: "L" }, // her
        { position: 10, answer: "E" },
      ],
    },
    paragraphMatching: {
      id: 8,
      type: "paragraphMatching",
      passage: `A.Certain   institutions,such   as   schools,are   likely   to   close   when    bad    weather,such    as    snow, flooding  or  extreme  heat  or  cold,causes  travel  difficulties,power  outages(断供),or   otherwise endangers  public  safety.When  snowy  weather  arrives  in  the  U.S.,it  means  the  chance  of  school children  benefiting  from  the  long-standing  tradition  of  the“snow  day”,when   schools  are   forced to close  and  students  get  an unexpected  day off. B.The  criterion  for  a  snow  day  is  primarily  the  inability  of  school  buses  to  operate  safely  on  their routes  and  danger  to  children  who  walk  to  school.Often,the  school  remains  officially  open  even though  buses  do  not  run   and  classes   are  canceled.Severe  weather  that   causes  cancellation  orr delay  is  more   likely  in  regions  that   are   less  able  to  handle  the   situation.Snow   days  are  less common  in  more  northern  areas  of  the  United   States  that  are  used  to  heavy  winter  snowfall, because   municipalities   are    well   equipped    to   clear    roads   and   remove    snow.In   areas    less accustomed to  snow even  small  snowfalls  of an inch or two may render roads unsafe. C.Snow  days  are  a  familiar  theme  in  American  film  and  TV  shows,with  children  getting  the  good news  and  then  running  outside  for  some  seasonal  snowman-building  and  snowball  throwing, against a background of joyful pop music.But the tradition is now over for pupils in several U.S. states   such   as    South   Carolina,Nevada,Georgia   and   Indiana.This   academic   year,many    school boards have  introduced policies which require  students  to  work  from  home  if the  school  is  shut by  snow  or  extreme  weather.They  are  known  as“e-learning  days”,which  certainly  sounds  less fun than  a  snow  day.D.Teachers  are  also  losing  their  snow  days  and  instead  will  be  expected  to  be  on  hand  to  take  a virtual  register  and   answer  students'questions  online.A  pilot  programme  in   a   school  district  in Anderson   County,South    Carolina,has   supplied    students   with    electronic    tablets   loaded    with assignments to  complete in the  event  of a  school  closure.If it  is  successful,it  could be  rolled out across  the  state.E.But  some  parents  object  to  the  new  policy  if  the  vigorous  debate  on  the  Facebook  page  of  Anderson  County  school  district  is  anything  to   go  by.“When   it  snows,let  the  kids   enjoy  it,” said   one   commenter.Another   said   the   decision   would“ruin   school   even   more”,and   someoneelse  called   snow  days“a  fun  part  of  childhood”.But   supporters  of  the   policy   say   it   means children  will  miss   fewer  days   of  school.It  will   also  bring  to   an  end  a  less  popular  U.S.high school   tradition:the“make-up   day”,which   requires    students   in   many    states   to   make   up   the time  lost  due  to weather by working  during  school  holidays.F.Students   in  North   Carolina   already   have   several   make-up   days   scheduled   because   of   school closures     during     Hurricane     Florence,    which     struck    in     September.    Tom      Wilson,   the  superintendent  (主管)of Anderson  County  school  district,said  the  change  away  from  snow  days makes  practical   and   financial   sense.He   said   technology   has   changed   every   profession,so   it makes  sense  to  use  it  to  “eliminate”make-up  days.Adam  Baker  of  the  Department  of  Education in  Indiana  said  e-learning  days  were  proving  a“great  success”.He  said  most  Indiana  schools already  use  digital  devices  during  lessons,so  it  was  an“easy  decision”to  extend  this  to  days when  schools  are  closed.He  denies  the  decision  is  depriving  children  of the  chance  to  enjoy  the snow."Students  are  still  able  to  enjoy  snow  days  and  outside  time,”he  said.“Many  have  PE and    science    assignments    that    have    them    out     enjoying    the    weather.”But    local    school superintendents  in  Ohio  are  resisting  proposals  to  adopt  e-learning  days.They  fear  that  students without  internet  access  at  home  will  be  disadvantaged  by   the  policy,and  superintendent  Tom Roth is concerned that e-learning days will offer a lower quality of education.G.There  are  also  so-called“blizzard  bags”,with  assignments  that  children  take  home  ahead  of  an expected  snow  closure.But  Mr  Roth  says  it  is  not  sufficient  as  a  replacement.“I  think  we  still need  the   class  time  to   give  our  kids  the   education  that  they   deserve”,he  said.“You  can't  get that with a blizzard bag or doing the work from home like that.It's not going to be as effective."H.There   is    a   long-running    debate    on   whether    missing   days    of   school    affects   attainment.In England,there has been  a  focus  on  tackling  absenteeism(旷课)from   school.The   Department   for Education(DFE)published  research  in  2016  arguing  that  missing  any  days  at  school  could  have a  negative  impact  on  results.Even  a  few  days  lost  in  a  year  could  be  enough  to  miss  out  on getting  a  good   exam  grade,the  DFE's  research   concluded.This  differed   from  the   findings  of  a study  from  Harvard  University  in  the  U.S.,which  concluded  that  missing  a  few  occasional  days because of the weather did not damage learning.I.The  Harvard   study  examined  seven  years   of  school  results   data  and  could  not   find  any  impact from  snow  closures.What  caused  more  disruption  was  when  schools  tried  to  stay  open  in  bad weather,even  though  many  staff  and  pupils  were  absent.But  weather  can  make  a  difference  to school  results,according  to  another  piece  of  Harvard   research   published  last  summer.It's  hot weather  that  has  the  negative  impact.The  results  of  10  million  school  students  were  examined over   13   years    and   researchers   found    a“significant”link   between   years   with    extremely   hot weather  and  lower  results.J.It's  obvious  that  students  should  go  to  school  every  day  to  get  the  most  out  of  education.In  cases of   extreme   weather    students    don't    always   have    that   option.However,research    shows    that authorised   absences   from   school   such   as   during   extreme   weather   are   less   problematic   for  students  than  absences  that  are  not  authorised.This  is  because  unauthorised  absences  tend  to reflect  patterns  and  behaviours  of  student  disengagement,or  the  possible  negative  attitudes  of parents  towards  education  that  students  adopt  and  carry  with  them  through  schooling.The  level of impact  on  students'educational performance  is  all  to  do with  the  length  of time that  a  student is  absent  from  school  and  how  regularly  this  occurs.`,
      sentences: [
        {
          text: "36.There  is  opposition  to  the  practice  of  giving  children  assignments  to  take  home  before  extreme weather  forces  a  school  closure.",
          answer: "G",
        },
        {
          text: "37.New policies adopted by many U.S.schools require  students to do online learning at home in case of a  school  closure.",
          answer: "C",
        },
        {
          text: "38.According   to   some   research,extreme   hot   weather   negatively   affects   students’performance.",
          answer: "I",
        },
        {
          text: "39.There  is  a  time-honoured  tradition  in  the  U.S.for  school  kids  to  stay  at  home  on“snow  days”.",
          answer: "A",
        },
        {
          text: "40.Debates  on   social  media  show  some  parents  are  opposed  to  ending  the“snow  day”tradition.",
          answer: "E",
        },
        {
          text: "41.In  more  northern  regions  of  the  U.S.,school  is  less  likely  to  be  affected  by  snowy  weather.",
          answer: "B",
        },
        {
          text: "42.Research indicates absences from  school with permission do not cause as many problems as those without   permission.",
          answer: "J",
        },
        {
          text: "43.There is  objection to  e-learning  days  owing to  fear that  students  with no  access to the Internet  at home  will  suffer.",
          answer: "F",
        },
        {
          text: "44.In  a  pilot  programme,students  are  given  electronic  devices  to  do  assignments  when   schools  are closed.",
          answer: "D",
        },
        {
          text: "45.A  long-standing  debate  is  going  on  over  the  impact  of  school   absences  on  students'academic performance.",
          answer: "H",
        },
      ],
    },
    readingComprehension: [
      {
        id: 9,
        type: "readingComprehension",
        article:
          "It may sound surprising, but you don't have to be interested in fashion, or even in history, to enjoy Dress Codes: How the Laws of Fashion Made History. I happen to be interested in both, and ended up enjoying the book for completely different reasons. Richard Thompson Ford is a law professor, and you probably won't forget that for even one page. His carefully reasoned arguments, packed with examples, sound almost like reading a court opinion, only maybe wordier. You will probably never think of fashion as a trifle again. Ford's thesis is that the best way to understand what particular fashions meant in any given era is to look at the restrictions placed on them. Through this lens, he shows us that the first laws passed in the 1200s to ensure that only the nobility were allowed to wear certain fabrics, colors and ornaments reflected the rise of the middle class, who were now able to imitate some of these fashions. The status of the upper classes was threatened; fashion was a tool to preserve it. Ford takes the reader through the evolution of fashion while examining the underlying motivations of status, sex, power, and personality, which, he assumes, influenced all innovations in fashion in the past and which continue to influence us today. His writing is more than a little dense—dense with research, clauses, and precise adjectives and nouns. But there's also humor and enough interesting episodes to make the writing appealing. No one is spared his sharp analysis: not the easy targets of 19th century women's crippling(伤害身体的) fashions nor the modern uniforms of Silicon Valley T-shirts. But the greatest strength of this book(on fashion!) is its intellectual profoundness. Ford asks us to question unconscious beliefs, to realize that we almost never do so, to understand that the simplest choices are charged with meaning, and yet that meaning can and does change all the time. Consider the fact that a 1918 catalog insisted that boys and girls be dressed in the appropriate color. We believe our thinking today is evolved; Ford shows us it's not.",
        questions: [
          {
            question:
              "46.What does the author think of the book Dress Codes: How the Laws of Fashion Made History?",
            options: [
              "A. It is read by people for entirely different reasons.",
              "B. It is meant for those interested in fashion history.",
              "C. It makes enjoyable as well as informative reading.",
              "D. It converts fashion into something for deliberation.",
            ],
            answer: "C",
          },
          {
            question:
              "47.How can people best understand a particular fashion in an era, according to Ford?",
            options: [
              "A. By examining the restraints imposed on it.",
              "B. By looking at what the nobility were wearing.",
              "C. By glancing at its fabrics, colors and ornaments.",
              "D. By doing a survey of the upper and middle classes.",
            ],
            answer: "A",
          },
          {
            question:
              "48.What was the aim of the first laws passed regarding fashion in the 1200s?",
            options: [
              "A. To facilitate the rise of the middle class.",
              "B. To loosen restrictions on dress codes.",
              "C. To help initiate some novel fashions.",
              "D. To preserve the status of the nobles.",
            ],
            answer: "D",
          },
          {
            question: "49.What does the author think of Ford's writing?",
            options: [
              "A. It uses comparison and contrast in describing fashions of different eras.",
              "B. It makes heavy reading but is not lacking in humor or appeal.",
              "C. It is filled with interesting episodes to spare readers intolerable boredom.",
              "D. It is characteristic of academics in presenting arguments.",
            ],
            answer: "B",
          },
          {
            question:
              "50.What does the author say is the greatest strength of Ford's book?",
            options: [
              "A. Plentiful information.",
              "B. Meaningful choices.",
              "C. Evolved thinking.",
              "D. Intellectual depth.",
            ],
            answer: "D",
          },
        ],
      },
      {
        id: 10,
        type: "readingComprehension",
        article:
          "The  art  of  persuasion  means  convincing  others  to  agree  with  your  point  of  view  or  to  follow your   course   of   action.For   some   of   us,persuasion   is   an   instinctive   quality   and   the   power   of influencing  comes  naturally.For  the  rest  of  us,persuasion  skills  can  be  learned  and  developed  over time.Employers  place  a  great  value   on   employees  with  persuasion   skills  because  they   can   impact several  aspects  of job  performance.Besides,teamwork  and  leadership  rely  heavily   on  the  power  of persuasion  to  get  things  done.Without  persuasion   skills,employees  may  not  be  as  committed  to  or convinced  of  the   importance   of  an   organization's   vision   and  long-term  mission.Effective  use  of persuasion  skills  willnot  only  help  get  your  coworkers  excited  about  your  ideas,it'll  also  help  you motivate them to  achieve  a  common goal.In  order  to  learn  the  art  of persuasion  at  the  workplace,you  need  to  understand  how  to  handle conflicts   and  reach   agreements.Good   communication   is  the   first   step   in   effective  persuasion,but logic  and  reasoning  arejust  as  important.Before  you  can  get  somebody  on-board  with  your  goal,you should help them understand why they  should  pursue  it.Using  visual  aids  to back up  your  ideas  can help communicate your ideas better and make compelling arguments  so your listeners will come to a logical choice and become fully committed to your ideas and plans.Successful persuasion  skills  are  based  on  your  ability  to  have  positive  interactions  and  maintainmeaningful  relationships  with  people.In  order  to  sustain  those  relationships,you  must  be  able  to work  in  their  best  interests  as  well.Your  coworkers  are  more  likely  to  agree  with  you  when  they succeed  alongside  you.The  more  they  achieve  and  the  greater  progress  they  make,the  more  they trust  your  judgement  and  strength.We  persuade  and  get  persuaded  every  day—we’re  either  convincing  or  being  convinced.A  vast majority  of  people  prefer  collaboration  and  teamwork  over  traditional  organizational   structures;no one  likes  to  be  told  what  to  do  or  to  be  pushed  around.Therefore,organizations  and  leaders  should adopt  powerful  persuasion  skills  to  bring  about  necessary  changes.",
        questions: [
          {
            question:
              "51.What  does  the  author  say  about  the  ability  to  be  persuasive  in  the  first  paragraph?",
            options: [
              "A. People may  either  be born  with  it  or  be  able  to  cultivate  it.",
              "B. It  proves  crucial  in  making  others  follow  one's  course  of  action.",
              "C. It  refers  to  the  natural  and  instinctive  power  of  influencing  one's  coworkers.",
              "D. People may view  it  as both  a  means  to  convince  others  and  an  art  of communication.",
            ],
            answer: "A",
          },
          {
            question:
              "52.Why  are  persuasion  skills  greatly  valued  in  the  workplace?",
            options: [
              "A. They  enable  employees  to  be  convinced  of  their  long-term  gains.",
              "B. They  enable  employees  to   trust  their   leaders  unconditionally.",
              "C. They  help  motivate  coworkers  to  strive  for  a  common  goal.",
              "D. They  help  an  organization  to  broaden  its  vision  effectively.",
            ],
            answer: "C",
          },
          {
            question:
              "53.What  should  people  do  to  learn  the  art  of persuasion  at  the  workplace?",
            options: [
              "A. Acquire   effective   communication   skills.",
              "B. Avoid  getting  involved  in  conflicts  with  others.",
              "C. Understand  the  reason  for  pursuing  their  goals.",
              "D. Commit  themselves  fully  to  their  ideas  and  plans.",
            ],
            answer: "A",
          },
          {
            question:
              "54.When  are  you  more  likely  to  succeed  in  persuading  your  coworkers?",
            options: [
              "A. When  they  are  convinced  you  work  in  their  interests  while  sacrificing  your  own.",
              "B. When  they  become  aware  of  the  potential  strength  of  the  judgements  you  make.",
              "C. When  they  become  aware  of  the  meaningful  relationships  you  keep  with  them.",
              "D. When  they  are  convinced  they  will  make  achievements  together  with  you.",
            ],
            answer: "D",
          },
          {
            question:
              "55.Why  are  organizations  and  leaders  advised  to  adopt  powerful  persuasion   skills   to  bring   about necessary   changes?",
            options: [
              "A. To  convince  employees  of  the  value  of  collaboration.",
              "B. To  allow  for  the  preferences  of most  people  of today.",
              "C. To  improve  on  traditional  organizational   structures.",
              "D. To   adapt   to   employees'ever-changing   working   styles.",
            ],
            answer: "B",
          },
        ],
      },
    ],
    translation: {
      id: 11,
      type: "translation",
      chinese:
        '汉语中的"福"字(the character fu)表示幸福和好运，是中国传统文化中最常用的吉祥 (auspicious) 符号之一。人们通常将一个大大的福字写在红纸上，寓意期盼家庭幸福、社会安定、国家昌盛。春节贴福 字是民间由来已久的习俗。为了欢庆春节，家家户户都会将福字贴在门上或墙上，表达对幸福生活的向 往、对美好未来的期待。人们有时还将福字倒过来贴，表示幸福已到、好运已到。',
      reference:
        "China is a country with a long history and rich cultural heritage. The Great Wall, as one of the most famous cultural heritages in China, is not only a symbol of China but also an important part of the world's cultural heritage.",
    },
    writing: {
      id: 12,
      type: "writing",
      topic:
        "Suppose your university is seeking students' opinions on whether university canteens should be open to the public. You are now to write an essay to express your view. You will have 30 minutes for the task. You should write at least 120 words but no more than 180 words.",
      tips: "作文",
    },
  },
  set3: {
    wordFilling: {
      id: 13,
      type: "wordFilling",
      passage: `You probably haven't taken the time to think of all the work that went into creating the shirt on your back. I mean, how hard it could be to create fabric and ___26___ sew it into a shirt shape. Don't machines do all that? Well, creating fabric from cotton, which is the most ___27___ abundant clothing material, is actually a process that involves a lot of water, 2,700 liters per shirt to be ___28___ exact. Take a look at the video below from National Geographic for some more mind-blowing ___29___ statistics about cotton clothing production.

Clean water is ___30___ increasingly becoming one of the most sought-after resources in the world. Given how large the ___31___ textile and cotton industries are, they take up a lot of our fresh water demands across the world, according to The Huffington Post. The video from National Geographic was created to spread ___32___ awareness of how environmentally harmful cotton is. But the situation can be made better. Through better water management and farming practices, water usage in cotton production can be cut down by ___33___ nearly 40 percent.

Called "Better Cotton", this environmentally conscious product will save millions of liters of water a year simply from ___34___ reducing the demands of cotton production. Cotton doesn't have to go, since it is, after all, one of the most useful cash crops across the globe. However, as water supplies ___35___ shrink, farmers and consumers need to be more conscious of the effect that these products have on the environment as a whole.`,
      wordBank: [
        "abstracts",
        "abundant",
        "awareness",
        "conscience",
        "exact",
        "increasingly",
        "intense",
        "mend",
        "nearly",
        "reckoning",
        "reducing",
        "sew",
        "shrink",
        "statistics",
        "textile",
      ],
      blanks: [
        { position: 1, answer: "L" },
        { position: 2, answer: "B" },
        { position: 3, answer: "E" },
        { position: 4, answer: "N" },
        { position: 5, answer: "F" },
        { position: 6, answer: "O" },
        { position: 7, answer: "C" },
        { position: 8, answer: "I" },
        { position: 9, answer: "K" },
        { position: 10, answer: "M" },
      ],
    },
    paragraphMatching: {
      id: 14,
      type: "paragraphMatching",
      passage: `A.We're   growing   more   used   to   chatting   to   our   computers,phones   and   smart   speakers   through voice  assistants  like  Amazon's  Alexa,Apple's  Siri  and  Microsoft's  Cortana.Blind  and  partially sighted  people  have  been  using  text-to-speech  converters  for  decades. B.Out   of  these   assistants,Siri   is   the  most  well-known.The   assistant  uses  voice   inquiries   and   a natural-language    user    interface ( 界 面 ) to    answer   questions.The    software    adapts    to   users' individual   language   usages,searches,and   preferences,with   continuing   use. C.Some  think  voice   could   soon  take   over  from  typing   and  clicking  as  the  main  way  to   interact online.But  what  are  the  challenges  of  moving  to  “the  spoken  web”? D.What  use  is  written  online  content  if  you  can't  read?That  is  the  situation  facing  illiterate(不识 字的)African  farmers.They  are  often  denied  crucial  information  the  web  offers  many  others. With  a  literacy  rate  in  some  parts  of Africa  at  only  22.6%,farmers  are  often“underpaid  for  their produce   because    they   might    be   unaware    of   the    prevailing   prices,"says    Francis   Dittoh,a researcher  behind  Mr  Meteo,a   speech-based  weather   information  service. E.“The  most   frequently  heard   complaint   is   about  rainfall  predictions,”says  Mr  Dittoh,who   lives in   Tamale,northern   Ghana.“They   tell   us   the   methods   their   forefathers   used   to   predict   the weather  don't  seem  to  work   as  well   these  days.”This  is  down  to   climate  change,he  believes. Yet  knowing  when  it's  going  to  rain  is  vital  for  farmers  wanting  to  sow  seeds,irrigate  crops  or take their animals out to the  fields to  feed  on grass. F.Mr  Dittoh  says  the  idea  of  converting  online  weather  reports  into  speech  came  from  the  farmers themselves,after  a  workshop  in  the  village  of  Guabuligah.“They   came  up  with  this,”he  says. Mr  Meteo  takes  the  online  weather  forecast,converts  it  to  a  short  recording  in  the  appropriate language  and  makes  it  available  on  a  basic  phone.Farmers  ring  up  to  receive  the  information. The  local  language  Dagbani  is  spoken  by   1.2  million  people  but  is  not  served  by  any  online translation  applications.The  service  was  designed  to  be  cheap  and  easy  to  run,says  Mr  Dittoh. He  plans  to  begin  field  tests  this  month,working  with  Tamale’s  Savanna  Agricultural  Research Institute. G.The  spoken  web  could  also  help  the  one-in-five  adults  in  Europe  and  the  U.S.with  poor  reading skills.But   building   the   spoken   web—web-to-voice   and   voice-to-web—isn't   straightforward.For software  to  understand  pizza  is  served  at  Italian  restaurants  is  easy.To  cover  multiple  domains and to be able to have a conversation with users on every single topic is still a long way off. H.So  although  many  computer  assistants  can  answer  simple  questions  about  the  weather  and  play music  for  us,anything  resembling  a  wide-ranging  human  conversation  is  decades  away.Artificial intelligence  just   isn't   smart   enough  yet.Even   turning  your  voice  into  text—automatic  speech recognition—is  one  of  the  hardest  problems  to  solve,as  there  are  as  many  ways  to  pronounce things  as  there  are  people  on  the  planet. I.Siri has  often been praised  for  its  ability  to  interpret  our  casual  language  and  deliver  very  specific and  accurate  results,sometimes  even  providing  additional  information.But  it  is  still  somewhat restricted,particularly  when  the  language  moves  away  from  stiffer  commands  into  more  human interactions.In    one    example,the     phrase“Send    a    text    to     Jason,Clint,Sam,and    Lee     saying we’re  having  dinner  at   Silver  Cloud  restaurant”was  interpreted  as   sending  a  message  to  Jason only,containing   the   text“Clint    Sam   and    Lee   saying    we're   having   dinner    at    Silver   Cloud restaurant”.It   has   also   been   noted   that    Siri   lacks   a   proper   editing   function,as   saying“Edit message  to   say:we're  at  Silver  Cloud  restaurant   and  you   should  come  find  us”generates“Clint Sam  and  Lee  saying  we're  having  dinner  at  Silver  Cloud  restaurant  to  say  we're  at  Silver  Cloud restaurant  and  you  should  come  find  us”. J.Using  voice  interaction  feels  far  more  intimate  than  surfing  the  net  the  old-fashioned  way.This  is intentional  as  the  informal  tone  of  the  assistant  helps  create  an  emotional  attachment.But  if something  speaks,it  must  also  listen.Our  phones  are  always  near  us  and  they  are  collecting  data about  us  all  the  time.This  has  already  raised  privacy  concerns.The  American  Civil  Liberties Union has  stated  that  digital  assistants  create  a  threat  to  privacy  from  hackers.Some people  have other  concerns.They  worry  assistants  will  one  day  be  used  to  deliver  advertising  directly  to  us. K.But  digital  voices  need  more  personality  to  make  them  popular.Robots  are  not  yet  witty,Siri  is boring.The  benefits  of  using  voice  instead  of  tapping  fingers  obviously  depend  on  the  context. Doctors  completing  online  forms  about  their  patients  by   speech,for  example,can  dictate   150 words  a  minute,three  times   faster  than  typing   on  a  keyboard.This   enables  them  to   spend  less time  on  administration  and  more  time  with  patients. L.Last   year,speech    recognition    company    Nuance   helped    a   doctors'surgery   in   Dukinfield,near Manchester,set  up  a  speech  system  for  the  practice's  six  doctors.Now  they  can  dictate  notes  on a   patient's   health    condition   and    treatment   and    a   smart    assistant   automatically   enters    the information  into  the  right  fields  on  a  web  form.Previously,the  doctors  made  voice  recordings that  were  then  transcribed  by  secretaries—a  process  that  was  costly  and  likely  to  cause  delays. The  new  system  means  letters  to  patients  now  have  more  detail. M.Using  voice  also  makes  sense  when  you're  doing  other  things  with  your  hands.Think  about when  you're  cooking,and  you just  want  to  know  what  the  next  step  in  the  recipe  is.Your  hands are  covered  with  oil;you're  not  going  to  get  on  the  iPad,so  it's  a  lot  more  natural  to  talk.And speech  obviously  makes   sense  when  you're   driving.In  the  U.S.,29%of  drivers   admit  they   surf behind   the   wheel,according   to   insurance   firm   State   Farm.This   is   up   from    13%in   2009.No wonder  using  mobile  phones  while  driving  causes  more  crashes  a  year  than  drink  driving,says the  U.S.National   Safety  Council. `,
      sentences: [
        {
          text: "36.According  to  Francis  Dittoh,their  speech-based  weather  information   service  was  meant  to  be inexpensive  and  easy to use.",
          answer: "F",
        },
        {
          text: "37.Using  voice  instead  of typing  enables  doctors  to  spend  more  time  taking  care  of patients.",
          answer: "K",
        },
        {
          text: "38.It  is  extremely  difficult  to  convert  voice  into  text  because  of  different  pronunciations.",
          answer: "H",
        },
        {
          text: "39.African farmers unable to read often don't have access to important information conveyed online.",
          answer: "D",
        },
        {
          text: "40.Some phone users worry  advertisers  willtake  advantage  of voice  assistants  to  send  ads  directly  to them.",
          answer: "J",
        },
        {
          text: "41.The  spoken  web  is  helpful  when  one's  hands  are  occupied.",
          answer: "M",
        },
        {
          text: "42.Some people believe  online  interaction  would  soon  depend  mainly  on  voice.",
          answer: "C",
        },
        {
          text: "43.Setting up  a  spoken  web  is by no means  an  easy  task.",
          answer: "G",
        },
        {
          text: "44.Weather  information  is  extremely  important  to  farmers.",
          answer: "E",
        },
        {
          text: "45.Some  people  are  concerned  about  privacy  because  their  phones  are  constantly  collecting  their personal   information.",
          answer: "J",
        },
      ],
    },
    readingComprehension: [
      {
        id: 15,
        type: "readingComprehension",
        article:
          "The  United   States   is   facing   a   housing   crisis:Affordable  housing   is  inadequate,while  luxury homes  abound (充裕),and  homelessness  remains  a  persistent  problem.Despite  this,popular  culture and the housing industry market happiness as living with both more space and more amenities(便利 设施).Big  houses  are  advertized  as  a  reward  for  hard  work  and  diligence,turning  housing  from  a basic necessity  into  a  luxury.This  is reflected  in  our  homes.The  average  single-family  home  built  in  the  United  States  before 1970  was  less  than  1,500  square  feet  in  size.By  2016,the  average  size  of  a  new,single-family  home was  2,422  square  feet.What's  more,homes  built  in  the  2000s  were  more  likely  than  earlier  models to   have   more    of   all    types   of   spaces:bedrooms,bathrooms,living    rooms,dining   rooms,recreation rooms  and  garages.There  are  consequences  of  living  big.As  middle-class  houses  have  grown  larger,two  things have  happened.First,large  houses  take  time  to  maintain,so   cleaners   and   other   low-wage   service workers  are  required  to  keep  these  houses  in  order.Second,once-public  spaces,where  people  from diverse   backgrounds   used    to    come   together,have    increasingly   become    privatized,leading   to    a reduction  in  the  number  of  public  facilities  available  to  all,and  a  reduced  quality  of  life  for  many. Take  swimming  pools.While  in   1950,only  2,500  U.S.families  owned  pools,by   1999  this  numberr was   4   million.At   the   same   time,public   municipal   pools   were   often   closed,leaving   low-income people  nowhere  to  swim.The  trend  for  bigger  housing  thus  poses  ethical  questions.Should  Americans  accept  a  system  in which  the  middle  and  upper  classes  enjoy  a  luxurious  lifestyle,using  the  low-wage  labor  of  others? Are we willing to accept a system in which an increase in amenities purchased by the affluent means a reduction  in  amenities  for  the poor?I  believe  neither  is  acceptable.We  must  change  the  way  we  think:living  well  does  not  need  to mean  having  more  private  spaces;instead,it  could  mean  having  more  public  spaces.A  better  goal than building bigger houses  for  some  is  to  create  more  publicly  accessible  spaces  and  amenities  for all.",
        questions: [
          {
            question:
              "46.What  are  big  houses  promoted  to  be  in  the  United  States?",
            options: [
              "A. A  luxury  for  the  homeless.",
              "B. A   reward   for   industriousness.  ",
              "C. An  abundant  source  of  comforts.",
              "D. An   absolute  necessity  for  happiness.",
            ],
            answer: "B",
          },
          {
            question: "47.What is  one  of the  consequences  of living big?",
            options: [
              "A. Many  Americans'quality  of  life  has  become  lower.",
              "B. People  from  diverse  backgrounds  no  longer  socialize.",
              "C. People  no  longer  have  access  to  public  swimming  pools.",
              "D. Many  Americans'private  life  has  been  negatively  affected.",
            ],
            answer: "A",
          },
          {
            question: "48.What  questions  arise  from  living  big?",
            options: [
              "A. Questions  related  to  moral  principles.",
              "B. Questions  having  to   do  with   labor  cost.",
              "C. Questions   about   what  lifestyle  to  promote.",
              "D. Questions concerning housing development.",
            ],
            answer: "A",
          },
          {
            question:
              "49.What  kind  of  social  system  does  the  author  think  is  unacceptable?",
            options: [
              "A. One  in  which  the  wealthy  exploit  the  low-wage  laborers  building  their  houses.",
              "B. One  in  which  the  rich  purchase  amenities  at  an  increasingly  unjustifiable  price.",
              "C. One  in  which  the  upper  classes  deprive  the  lower  classes  of  affordable  housing.",
              "D. One  in which the  affluent  enjoy  a  more  comfortable  life  at  the  expense  of the  poor.",
            ],
            answer: "D",
          },
          {
            question:
              "50.What  does  the  author  advocate  for  people  to  live  well?",
            options: [
              "A. Finding  ways  to  turn  private  spaces  into  public  ones.",
              "B. Building  more  houses  affordable  to  those  less  affluent.",
              "C. More  public  spaces  created  for  everyone  to  enjoy.",
              "D. All  amenities  made  accessible  to  the  rich  and  the  poor  alike.",
            ],
            answer: "C",
          },
        ],
      },
      {
        id: 16,
        type: "readingComprehension",
        article:
          "Most  of  us  in  the  entrepreneurial  community  are  blessed—or  cursed—with  higher-than-average ambition.Ambitious  people  strongly  desire  accomplishments  and  are  willing  to  take  more  risks  and spend  more  effort  to  get  them.Overall,this  is  a  positive  quality,especially  for  people  trying  to  build  their  own  businesses.Apparently,if you're  more  naturally  driven  to   set  goals,you  are  more  likely  to   succeed.Actually,this  isn't  always  the  case.In  fact,in  some  cases,extreme  ambition  may  end  up  doing more  harm  than  good.One  major  side  effect  of  excessive  ambition  is  the  tendency  to  focus  too  determinedly  on  one particular  vision  or  end  goal.This  is  problematic  because   it  hinders  your   ability  to   adapt  to  new  circumstances,which   is   vital   if  you   want   to   be   a   successful   entrepreneur.If   a   new   competitor emerges  to  threaten  your  business,you   may  need  to  change  direction,even  if  that  means  straying from  your  original  vision.If  you  have  too  much   ambition,you'll   find  this  hard,if  not   impossible.Few  people  are   successful  when  they  try  to  build  their  first  brand.Unfortunately,for  the  most ambitious  entrepreneurs,a  failure  is  seen  as  disastrous,and  impossible  to  recover  from.It's  a  clear  departure  from  the  intended  plan  toward  the  intended  goal.For  people  with  limited ambition,however,failure   is  viewed   as   something   closer   to   reality.Remember,failure   is   inevitable, and every failure you survive is a learning experience.Ambitious   people    tend   to    be    more   materialistically    successful    than   their    non-ambitious counterparts.However,they're    only     slightly    happier     than    their     less-ambitious    counterparts,and tend  to  live  significantly  shorter  lives.This  implies  that  even  though  ambitious  people  are  more likely    to    achieve     conventional“success”,such    success    means     nothing    for    their    health     and happiness—and  if  you  don't  have  health  and  happiness,what  else  could  possibly  matter?Clearly,some   amount   of   ambition    is   good    for   your    motivation.Without   any   ambition,you wouldn't  start  your  own  business,set  or  achieve  goals  and  get  far  in  life.But  an  excess  of  ambition can  also  be  dangerous,putting  you   at  risk  of  burnout,stubbornness   and  even   a  shorter  life.",
        questions: [
          {
            question:
              "51.What  does  the   author  think   of  most  entrepreneurs?",
            options: [
              "A. They  are  more  willing  to  risk  their  own  lives.",
              "B. They  are  more   ambitious  than  ordinary  people.",
              "C. They  achieve  greater  nonconventional  success.",
              "D. They  have  more  positive  qualities  than  most  of  us.",
            ],
            answer: "B",
          },
          {
            question:
              "52.What   does   the   author   imply   by   saying“this   isn't   always   the   case”(Line    1,Para.3)?",
            options: [
              "A. Ambitious  people  may  not  have  a  greater  chance  of  success.",
              "B. Ambitious  people  may  not  have  more  positive  qualities.",
              "C. Entrepreneurs'ambition  does  as  much  good  as  harm.",
              "D. Entrepreneurs  are  more  naturally  driven  to  success.",
            ],
            answer: "A",
          },
          {
            question:
              "53.What  does  the  author  say  is  of  extreme  importance  for  one  to  become  a  successful  entrepreneur?",
            options: [
              "A. Holding  on  to  one's  original  vision.",
              "B. Being  able  to  adapt  to  new  situations.",
              "C. Focusing  determinedly  on  one  particular   goal.",
              "D. Avoiding  radical  change  in  one's  career  direction.",
            ],
            answer: "B",
          },
          {
            question:
              "54.How  do  the  most  ambitious  entrepreneurs  regard  failure  in  their  endeavor?",
            options: [
              "A. It  will   awaken  them  to  reality.   ",
              "B. It  is  a  lesson  they  have  to  learn.   ",
              "C. It  means  the  end  of  their  career.",
              "D. It  will  result  in  a  slow  recovery.",
            ],
            answer: "C",
          },
          {
            question:
              "55.What  does  the  author  advise  us  to  do  concerning  ambition?",
            options: [
              "A. Distinguish  between  conventional  success  and  our  life  goal.",
              "B. Follow  the  example  of  the  most  ambitious   entrepreneurs.",
              "C. Avoid  taking  unnecessary  risks  when   starting  a  business.",
              "D. Prioritize  health  and  happiness  over  material   success.",
            ],
            answer: "D",
          },
        ],
      },
    ],
    translation: {
      id: 17,
      type: "translation",
      chinese:
        "中国越来越重视终身教育，发展继续教育是构建终身教育体系的有效途径。高校作为人才培养 的基地，拥有先进的教学理念和优越的教学资源，理应成为继续教育的办学主体。因此，近年来许多 高校适应社会需求，加强与用人单位沟通，努力探索一条符合中国国情的继续教育发展新路，以使继 续教育在国家发展战略中发挥更大的作用。",
      reference:
        "China is the world's largest developing country with a long history and rich cultural heritage. Since the reform and opening up, China's economy has developed rapidly and people's living standards have improved significantly. China actively participates in international cooperation and has made important contributions to world peace and development. China adheres to the path of peaceful development and is committed to building a community with a shared future for mankind.",
    },
    writing: {
      id: 18,
      type: "writing",
      topic:
        "Suppose  your   university  is  conducting  a  survey  to  collect  students’opinions  of  online classes.You   are    to    write    a   response    to    the    survey   about    their    advantages    and disadvantages,and  what  improvements  can  be  made.You  will  have  30  minutes for  the task.You  should  write  at  least  120  words  but  no  more than 180  words.",
      tips: "作文",
    },
  },
  set4: {
    wordFilling: {
      id: 19,
      type: "wordFilling",
      passage: `Whether you're just having  a  down  day  or  a  down  period,taking  a  walk  can  instantly  lift  yourr mood,especially   when    you   go    outdoors.Not    only    can   walking    make   you    less    depressed,but according  to   a   new   study,depression   sufferers   who   took   a    ___26___   walk   showed  just   as   much improvement  in  their   ___27___   as  people  taking  medicine.In   fact,60-70  percent  of  the  participants  in the study could no longer even be   ___28___   as  depressed.
Bone  density  may  not  be  one  of  the   most   exciting  health  benefits   of  walking,but   it's   an important  one.People  with  stronger  bones  avoid  osteoporosis (骨质疏松症)and  all  the  problems that    ___29___   with  it,like  breaks  and  other  disabilities.And  the  best  way  to  get   strong,healthy  bones is  by  doing  weight-bearing   exercises  like  running,dancing   and  walking,according  to   a  large   study. But   as   regards   bones,it's   ___30___   use  it  or  lose  it:To  keep  your  bones   strong  you  have  to  keep exercising.The   researchers    found    that   adults    who    walked   regularly    had   better    bone    density throughout  their  lives  than  their    ___31___  friends.
Taking  a  walk  can  be  great  for   ___32___   your   head   or  blowing   off  some   steam.It   also  provides  a great   opportunity   to   ___33___   with   friends   and   family,far   away   from   electronics   and   other   ___34___   at  home.Even   better,you   set   a   powerful   example   because   when   they   see   you    ___35___   the   benefits   of walking,they'll   be    encouraged    to    walk    more,too.
`,
      wordBank: [
        "accompany",
        "approved",
        "bond",
        "classified",
        "clearing",
        "come",
        "daily",
        "definitely",
        "distractions",
        "exclusively",
        "inactive",
        "occurrences",
        "reaping",
        "symptoms",
        "typical",
      ],
      blanks: [
        { position: 1, answer: "G" }, // easily
        { position: 2, answer: "N" }, // however
        { position: 3, answer: "D" }, // it
        { position: 4, answer: "F" }, // slowly
        { position: 5, answer: "H" }, // moreover
        { position: 6, answer: "K" }, // difficultly
        { position: 7, answer: "E" }, // hardly
        { position: 8, answer: "C" }, // quickly
        { position: 9, answer: "I" }, // therefore
        { position: 10, answer: "M" }, // but
      ],
    },
    paragraphMatching: {
      id: 20,
      type: "paragraphMatching",
      passage: `A.The  first  thing  you  notice  in  the  staircase  to  the  fourth-floor  studio  on  Canal  Street  in  Manhattan,New  York,is  the  measured  thumping (嘭嘭声)coming from behind a metal door. Just  beyond  the  entrance,large  lion  masks  were  twisting  and  turning  to  the  drum-beat.On  a recent Friday  evening,the  teenagers  made  their way  across  the  studio  floor  as  they  practiced Chinese lion dancing. B.“You want to play in a circle,”Victor Fong,aged 24,told his students at the New York Chinese Freemasons  Athletic  Club.“Take  it  slow  and  do  it  again.”The  dance  group,made  up  of  60 members,performs  throughout  the  year  but  was  now  preparing  for  its  biggest  events,Chinese Lunar  New  Year  celebrations,which  will  begin  on   Saturday  and  conclude  on  February   15. Teenagers comprise about half of the group,many of whom began lion dancing at the age of 14. About  100  current  and  past  members  of the  dance  group—which  has  been  performing  since 1956—will be among the 220 groups marching through Chinatown in Manhattan for the  18th Lunar New Year Parade on February 5. C.Mr.Fong has been involved in the organization since he was 15 and began teaching lion dancing three  years  ago.But  the  club  also  acts  as  a  recreation  center  and  safe  haven  (庇护所) for  teenagers,with  video  games  readily  available.As  many  as  20  students  show  up  after  school. “The basic requirement for hanging out here is you have to learn how to lion dance,”Mr.Fong said.While  that  is  not  a   formal  requirement  for  being  a  member,everyone   finds  a  way  to participate in the Lunar New Year Parade,whether it's by dancing,carrying a flag or beating a drum. D.Alvin  Chau,aged 26,is  an  environmental  consultant by  day  and  a  lion  dancer  on  weekends.He has been a club member for 10 years and joined because of an interest in lion dance.“We're a big family,"he  said,shaking  hands  with   other  members   as  they  walked  through  the   door.“You know everyone." E.It is believed that the lion dance began in the third century.Stories vary about how lion dancing came to be,but most of them include a monster named Nian who would terrorize a village.The villagers finally banded together and scared the beast away with firecrackers (爆竹)and  drums. While lions are not native to China,some versions of the story include the villagers creating a monster of their own in the shape of a lion to fight off the beast. F.Today,the  dancers  travel  across  Chinatown  going   from  business  to  business  to  bring   good  luck for  the  coming  year.The  new  year—according  to  the  Chinese  lunar  calendar—will  begin  on Saturday      and      marks       the      Year      of      the       Rooster   ( 鸡 年 ) , which      is      thought      to     be      a      symbol     of positivity.“It's  almost  like  the  dark  night   is  ending  and  the   sun  is  coming  up,”said  Ya  Yung Teng,the  digital  collections  coordinator  for  the  Museum  of  Chinese   in   America."It's   hopeful that  we're  going  to  have  a  new  day."Roosters  and  chickens  are  not  particularly  strong  creatures, Ms.Teng    said,but   they    are   numerous."In    a   way,"she    said,the   rooster“stands    for‘We   the People.'” G.The  lion  head  and  tail  are  operated  by  two  people.As  one  person  controls  the  head,a  second follows  under  a  train  of  fabric  representing  the  body.The  dancers  move  in  harmony  as  they imitate  the  animal's  natural  movements  in  the  wild,including  the  aggressiveness  of  an  attack.A lion  head  figure  weighs  under   10  pounds  and  sits  squarely  on  the  dancer's  shoulders.Inside,the dancer  manipulates  strings  that  open  and  close  the  lion's  eyes,shake  its  ears  and  open  its  mouth to  reveal  a  fire-orange  tongue. H.“A  good  lion  dancer  will  imitate  a  living  creature,”said  Karlin  Chan,aged  59,who  heads  the athletic  club's  community  public  relations.“I  started  lion  dancing  when  I  was  a  kid,”he  said. “Chinatown  was  much   smaller  then   and  it  was   a  celebration  with   fireworks   and  firecrackers, which added a lot of flavor and meaning to it." I.Mr.Chan  buys  a  new  lion  head  each  year  when  he  travels  to  China.A  head  costs  about  $1,500.  "If  you   want  the  good  stuff,the  quality,you  have  to  see  it  for  yourself,"he  said.“I'll  inspect  the  product  before  we  put  it  in  the  container  and  ship  it  over."Mr.Chan,who  has  been  involved  with  the  club  for  nearly  50  years,said  that  passing  the  dance  from  one  generation  to  the  next  was  vital.“You  need  to  pass  on  the  traditions  and  the  culture,and  this  is  a  part  of  our  culture,” he  said.“It's  a  great  way  to  promote   cultural  understanding   and  exchange;we  welcome  that.” J.For   Sara   Pore,aged   17,another   club   member,lion   dance   is   more   than  just   tradition;it  provides a  creative  outlet.“Lion  dancing  started  2,000  years  ago—that's  incredible,”she  said.“But  what makes  you  a  competent  lion  dancer  is  that  there's  a  sense  of  imagination  involved.Lion  dancing teaches  competence  in  leadership  because  of  this.You're  constantly  forced  to  push  yourself  past your  limit.” K.Back   at   rehearsal(排练),Justin   Le,aged   18,tied   a   red   ribbon   around   his   waist   to   practice jumping.The   dancers   use   the   ribbons   to   pull   themselves   up    over   their   partners'heads.The room's  ceilings  are  too  low  to  wear  the  lion  heads  for  jumping  practice,so  once  up  on  his partner's  head,Mr.Le  held  out  his  arms  as  if  in  offering. L.Mr.Le     comes      by     the      dance      as     a      legacy( 传 承 ) .“I      was       born      into       it,”Mr.Le       said,noting      that       his uncle  and  father  were  club  members.“Growing  up,I  would  always  watch  my  family  and  see  the lion  dance,and  I  slowly  grew  interested  in  it."By  the   age  of  14,he  was   fully  enrolled  in  the athletic   club’s   lion   dance   group.“I   value   my   culture   and   tradition,being   Chinese   or   Asian- American.I  have  a  lot  of  pride  in  that,”he   said.“I  want  to  contribute  and  give  back  to  the community.” `,
      sentences: [
        {
          text: "36.The  lion  dancers  perform  from  door  to  door  to  bring  New  Year  wishes  to  business  people.",
          answer: "F",
        },
        {
          text: "37.The  New  York  dance  club  also  serves  as  a  place  for  entertainment  where  youngsters  can  enjoy themselves   safely.",
          answer: "C",
        },
        {
          text: "38.Lion  dancers  need  to  have  a  little  imagination  to  perform  well.",
          answer: "G",
        },
        {
          text: "39.There  are  a  number  of different  versions  about  the  origin  of the  lion  dance.",
          answer: "E",
        },
        {
          text: "40.Some  50%of the  members  of  a  New  York  lion  dance  club  are  teenagers.",
          answer: "B",
        },
        {
          text: "41.One  club  member  says  he  feels  proud  of his  cultural  tradition.",
          answer: "L",
        },
        {
          text: "42.Two   dancers   coordinate  their  movements,one  manipulating  the   lion's  head   and   the   other   its body.",
          answer: "G",
        },
        {
          text: "43.One  lion  dancer  compares  their New  York  dance  club  to  a  family.",
          answer: "D",
        },
        {
          text: "44.Lion  dance  should  be  handed  down  to  future  generations  as  part  of  Chinese  culture.",
          answer: "I",
        },
        {
          text: "45.One  lion  dancer  learned  how  to  perform  from  his  elders.",
          answer: "L",
        },
      ],
    },
    readingComprehension: [
      {
        id: 21,
        type: "readingComprehension",
        article:
          "Team-building exercises have become popular for managers trying to increase organisational and team   harmony   and   productivity.Unfortunately   many    employees   resent   compulsory   bonding    and often regard these  exercises  as  a  nuisance.A  paper  published  this  week  by  University  of  Sydney  researchers  in  Social  Networks  has reported    participants’feelings     about     team-building     interventions      ( 干 预 ) , revealing     ethical implications  in  forcing  employees  to  take  part.“Many  people  see  team-building  activities  as  a  waste  of  time,so  we  decided  to  look  in  more depth  at  what's  behind  this,”said  the  paper's  lead  researcher,Dr  Peter  Matous.“Teams  are  formed,combined  and  restructured.Staff  are  relocated  and  office  spaces  redesigned.All this  is  done  with  the  aim  of improving  workplace  efficiency,collaboration  and  cohesion.But  does any  of  this  work?”said  Dr  Matous.The  study  found  that  team-building  exercises  which  focused  on  the  sharing  of  and  intervening into  personal  attitudes  and  relationships  between  team  members  were  considered  too  heavy-handed and   intrusive,although   the   researchers   say   some   degree   of   openness   and   vulnerability   is   often necessary  to  make   deep,effective  connections  with   colleagues.“Some    participants    were    against    team-building    exercises    because    they    were    implicitly compulsory.They   didn't   welcome   management's   interest   in   their   lives   beyond   their   direct   work performance,said   Matous.“Many   people   don't   want   to   be    forced   into   having    fun   or   making friends,especially not  on top  of their busy jobs.They  feel  management is being too nosy  or trying to control  their  lives  too  much.In  this  study  the  researchers  recommended  a  self-disclosure(表露)approach   where   participants were  guided  through  a   series  of  questions  that  allowed  them  to  increasingly  disclose  personal information  and  values.The  method  is  well-tested  and  has  been  shown  to  increase  interpersonal closeness.However,to  be   successful   it  must  be   voluntary.The researchers  said  there  are  numerous  schools  of thought  that  propose  differing  psychological methods   for   strengthening   relationships.“With   caution,many  relational  methods  to   improve  teams and  organisations  can  be  borrowed  from  other  fields.The  question  is  how  to  apply  them  effectively to  strengthen  an  entire  collective,which  is  more  than  just  the  sum  of  individual  relationships,”said Dr  Matous.",
        questions: [
          {
            question:
              "46.Why  are  many  employees  opposed  to  team-building  exercises?",
            options: [
              "A. They  consider  such  exercises  annoying.",
              "B. They  deem  these  exercises  counter-productive.",
              "C. They  see  such  exercises  as  harmful  to  harmony.",
              "D. They  find  these  exercises  too  demanding.",
            ],
            answer: "A",
          },
          {
            question:
              "47.What  did Dr Matous  and his team  do  to  find  out whether team-building  activities  would  improve productivity?",
            options: [
              "A. They  relocated  team  leaders  and  their  offices.",
              "B. They  rearranged  the  staff  and  office  spaces.",
              "C. They  redesigned  the  staff's  work  schedules.",
              "D. They  reintroduced  some  cohesive  activities.",
            ],
            answer: "B",
          },
          {
            question:
              "48.What  did  the   study  by  Matous'team   find  about   some  team-building   exercises?",
            options: [
              "A. They  were  intended  to   share  personal   attitudes   and  relationships.",
              "B. They  implicitly  added  to  the  vulnerability  of  team  members.",
              "C. They  invariably  strengthened  connections  among  colleagues.",
              "D. They  were  regarded  as  an  intrusion  into  employees'private  lives.",
            ],
            answer: "D",
          },
          {
            question:
              "49.How  can  the  self-disclosure  approach  succeed  in  increasing  interpersonal  closeness?",
            options: [
              "A. By  allowing  participants   freedom  to  express  themselves.",
              "B. By  applying  it  to  employees  who  volunteer  to  participate.",
              "C. By  arranging  in  proper  order  the  questions  participants  face.",
              "D. By  guiding  employees  through  a  series  of  steps  in  team  building.",
            ],
            answer: "B",
          },
          {
            question:
              "50.What  does  Matous  think   of  the  various  psychological  methods  borrowed   from  other  fields  for strengthening     relationships?",
            options: [
              "A. They  must  be  used  in  combination  for  an  entire  collective.",
              "B. They  prioritise   some  psychological   aspects  over  others.",
              "C. They  place  too  much   stress  on  individual  relationships.",
              "D. They  have  to  be  applied  cautiously  to  be  effective.",
            ],
            answer: "D",
          },
        ],
      },
      {
        id: 22,
        type: "readingComprehension",
        article:
          "There  are  close  to  58,000  homeless  people  in  Los  Angeles  county.That's  a  shocking  and  tragic number  for  a  region  that's  home  to   some   of  the  richest  people   in  the  world.At   last,the  problem became  so  acute—and  so  visible—that  Los  Angeles  took   extraordinary   action.The  citizens  of  this county  voted  in  November  2016  and  again  in  March  2017  to  raise  their  own  taxes.The  purpose  of such   action   is   to   fund   an   enormous   multibillion-dollar,10-year   program   of   housing   and   social services  for  the  homeless.As  a  result,Los  Angeles  now  has  its  best  chance  in  decades  to  combat  homelessness.This  is  an opportunity   that   surely   all   can   agree   must   not   be   wasted.It   is   neither   desirable   nor   morally acceptable nor practical for this county to tolerate the signs of deprivation more commonly associated with the  slums (贫民窟)of Rio de Janiero.How did we get here?For as long as there are homeless people,there is a tendency to blame the victims  themselves  for  their  condition—to  see  their  failure  to  thrive  as  an  issue  of  character,of moral  weakness,of  laziness.But  contrary  to  popular  belief,the  homeless  in  Los  Angeles  are  not mostly  mentally  ill  or  drug  addicted  or  frightening,although  a  sizable  minority  meet  some  of  those descriptions.Today,a   greater   and    greater   proportion    of  people   living    on   the   streets    are   therebecause of bad luck or a series of mistakes,or because the economy forgot them—they lost a job orr were       evicted ( 逐 出 )or     fled     an     abusive     marriagejust     as     the     housing     market     was     growing     increasingly unforgiving.The  challenges  are  enormous,even  if  everyone  is  pulling  in  the  same  direction.That  reality  was driven home this month by  a new Los Angeles Homeless  Services Authority report  showing  that the county's  homeless  population  is  growing  faster  than  the  supply  of new  housing.In  the  world's  richest  nation,homelessness  on  this   scale  should  be   shameful  and   shocking.But most    Los    Angeles    residents    are    no    longer    either    shocked    or     shamed.Increasingly,we    are uncomfortable,annoyed,disgusted,scared        or        unaware.Compassion (同情心)is being replaced by resignation.",
        questions: [
          {
            question:
              "51.Why  did the  citizens  of Los  Angeles vote to raise their  own taxes?",
            options: [
              "A. To   combat   the   county's   homelessness.",
              "B. To  reform  the  county's  service  system.",
              "C. To  fund  the   development  of  local  infrastructure.",
              "D. To  narrow  the  gap  between  the  rich  and  the  poor.",
            ],
            answer: "A",
          },
          {
            question:
              "52.What  do  people  tend  to  believe  about  the  homeless?",
            options: [
              "A. They  seldom  meet  the  descriptions  of  homelessness.",
              "B. They  are  the  victims  of  fast  economic  development.",
              "C. They  are  responsible  for  their  own  condition.",
              "D. They  account  for  the  majority  of  drug  addicts.",
            ],
            answer: "C",
          },
          {
            question:
              "53.What is one of the causes  for more  and more people in Los Angeles to become homeless?",
            options: [
              "A.They  find  it  increasingly  difficult  to  afford  a  place  to  live.",
              "B.The  divorce  rate  in  the  county  has  been  on  a  steady  rise.",
              "C.They  have  been  compelled  to  take  low-paying  jobs.",
              "D.The  society  fails  to  forgive  them  for  their  mistakes.",
            ],
            answer: "A",
          },
          {
            question:
              "54.What  do  we  learn  from  the  new  Los  Angeles  Homeless  Services  Authority  report?",
            options: [
              "A. Supplying  enough  job  opportunities  for  the  homeless  remains  a  challenge.",
              "B. Everyone  is  pulling  in  the  same  direction  to  solve  the  homelessness  problem.",
              "C. The increase in new housing falls short of the demand of the growing homeless population.",
              "D. Los  Angeles'homeless  condition  is  deteriorating  faster  than  many  people  predict.",
            ],
            answer: "C",
          },
          {
            question:
              "55.How  do  most  Los  Angeles  residents  now  feel  about  homelessness?",
            options: [
              "A. They  are  increasingly  ashamed  about  its  scale.",
              "B. They  find  it  no  more  scaring  than  it  appears.",
              "C. They  are  less  and  less  indifferent  to  it.",
              "D. They  no  longer  find  it  shocking.",
            ],
            answer: "D",
          },
        ],
      },
    ],
    translation: {
      id: 23,
      type: "translation",
      chinese:
        "中国政府一直大力推行义务教育 (compulsory      education),以使每个儿童都享有受教育的机会。 自1986年《义务教育法》生效以来，经过不懈努力，实现了在全国推行义务教育的目标。如今，在中  国，儿童年满六周岁开始上小学，从小学到初中一共接受九年义务教育。从2008年秋季学期开始，义  务教育阶段学生无需缴纳学费。随着一系列教育改革举措的实施，中国义务教育的质量也有显著提高。",
      reference:
        "Chinese civilization has a long history and is profound and extensive. Since ancient times, the Chinese nation has been known for its diligence and wisdom. In the long process of historical development, Chinese culture has formed unique values and moral systems, which have had a profound impact on the development of world civilization. Today, China is committed to inheriting and promoting excellent traditional Chinese culture while actively absorbing advanced cultural achievements from countries around the world, promoting Chinese culture to radiate new vitality and vigor in the new era.",
    },
    writing: {
      id: 24,
      type: "writing",
      topic:
        "Suppose   the  student  union   of your  university   is   organizing  an   online   discussion   on college  students  doing  community  service.You  are  to  write  an  essay  on  its  benefits  and the service you  can provide  to  the  community.You  will  have  30  minutes for  the  task.You should write at least 120  words  but no  more  than  180 words.",
      tips: "作文",
    },
  },
  set5: {
    wordFilling: {
      id: 25,
      type: "wordFilling",
      passage: `Exercising  for  just   10  minutes  a  week  is  linked  to  a  longer  life,according  to  a  new   study published  in   The  British  Journal  of Sports  Medicine.
Several  recent  studies  have  found  that  even  low-intensity  exercise,done  for  a  short  amount  of time,can   have   a   meaningful ___26___          on  health.Still,the  idea  that  exercising  for  just   10   minutes  a
week may be  enough  to  increase  your  lifespan  is  novel.It's  also  somewhat  ___27___        ,since   the   federal
physical  activity  guidelines  recommend  getting  at  least  75  minutes  of  vigorous   exercise  or   150 minutes of ___28___         exercise  each  week.
The  study  was  based  on  data  from  more  than   88,000  U.S.adults  who  ___29___          in  the  National
Health  Interview  Survey  between  1997  and  2008.
Contrary  to  some  research  that  has  found  an   ___30___          limit  to  the   amount  of  exercise  that  is healthy,the   researchers   found   that   there   was  ___31___         no  limit  to  the  longevity(长寿) benefits  of exercise.Even  the  small  group  of people  who  got  10  times  the  amount  of  exercise  recommended  by the  federal  government  had  a  46%lower ___32___          of death  than  the  least  active  group.
Still,observational   studies   like   this   one   cannot   prove   cause   and   effect;they   can   only   find 	___33___    .The  researchers  also  were  not  able  to  ___34___         for  certain  lifestyle  factors  that  could  affect lifespan,including  dietary  habits  and  changes  in  physical  activity  over  time.Despite  these  ___35___         
the   study's   results   are   yet   another   indication   of   the   power   of   physical   activity,even   in   small amounts.`,
      wordBank: [
        "adjust",
        "alter",
        "approximately",
        "controversial",
        "coordinates",
        "impact",
        "limitations",
        "moderate",
        "participated",
        "patterns",
        "populated",
        "risk",
        "seemingly",
        "type",
        "upper",
      ],
      blanks: [
        { position: 1, answer: "F" }, // however
        { position: 2, answer: "D" }, // our
        { position: 3, answer: "H" }, // for example
        { position: 4, answer: "I" }, // moreover
        { position: 5, answer: "O" }, // therefore
        { position: 6, answer: "M" }, // their
        { position: 7, answer: "L" }, // his
        { position: 8, answer: "J" }, // her
        { position: 9, answer: "A" }, // its
        { position: 10, answer: "G" }, // such as
      ],
    },
    paragraphMatching: {
      id: 26,
      type: "paragraphMatching",
      passage: ` A.Earlier  this  year,scientists  warned  that  one  in   six  animal   species  could  go  extinct(灭绝的)due to  climate  change.Could  the  same  thing  happen  to  our  crops  and  other  foodstuffs  too? B.It's  clear  that  farmers  in  many  parts  of  the  world  are  going  to  find  things  harder  in  the  coming decades.Last  week,BBC  Future   explored   one   scientist's   efforts   to   help   crops   cope   with   the increased   probability   of   droughts.By   using   the   genes    from   resurrection( 复 活 ) plants,JillFarrant of the University of Cape Town is exploring whether she can design crops to survive forr much  longer  periods  without  water.C.But  if we  can't  find  ways  to  protect  other  foods,will  they  survive  climate  change?Fortunately,there  is  some  good  news  on  this  front.Despite  alarmist  headlines  about“foods  that  are  going  extinct,” there  is  no   evidence  that  major   food  types  like  beans,chocolate,wine,corn   or  wheat  will   cease  to  exist. D.But  that  doesn't  mean  it's  all  good  news  for  future  food.We  will  probably  have  to  change  where we   grow   certain   crops,as   some   regions   get   too   hot.The   disadvantage,obviously,is   that   local farmers  will  suffer  under  this  situation.And  some  people  may  struggle  to  get  the  same  access  to certain   foods.“Even  if  overall   food  production  may  be  unaffected,food   security   can   still  be impacted,”says   Margaret    Walsh,a   scientist    at   the    U.S.Department    of   Agriculture's   Climate Change  Program  Office.In  other  words,even  if  a  certain  food  is  still  grown  on  some  corner  of the Earth,it doesn't mean that everyone will continue to have the same degree of access as today. E.Overall,the   yields   of   many    foods,from   staples   to    life-enhancing   extras    such   as   coffee    and chocolate,will  likely  be  impacted  by  climate  change  too.How  those  decreases  will  be   felt  will depend  on  the  degree  of  warming  and  the  crop  in  question,but  in  general,“anything  over  about 30℃  is  very  bad  for  crops,"says  Wolfram  Schlenker,an  associate  professor  of  international  and public  affairs  at  Columbia  University.For  example,statistical   studies  that  he   and   a   colleague built of corn and soybean(大豆)production  in  the  U.S.show   a   steep  decline  after  crossing  the 30℃  temperature  threshold(临界点). F.In  the  U.S.—the  world's  largest  producer  of  corn  and  soybeans—farms  can  move  north  to  some degree,Schlenker  says.But  eventually,yields  will  likely  suffer  because  the  soil  north  of  Iowa declines  in  quality—a  legacy  of  glacial(冰川的)expansion.Other    studies,including     studies    ofwheat in India and corn in Africa,also found that there is a threshold above which yields  sharply  decline:crops  can  adapt  and  move,but  only  to  a  point.“What's  common  to  all  studies  is  the  finding  that  extreme  heat  is  damaging  to  crop  growth,although  exact  cutoffs  vary  by  crop,” Schlenker   says.“If  predictions   for   the   end   of   the   century   are   true,though,I   think   a   lot   of  agricultural  areas  in  the  U.S.will   see  significant  hits."G.Under   current   conditions,about   4%of  the   world's   croplands   experience   drought   in   any   given year,but  by  the   end  of  the   century  those   conditions  are  forecasted  to  jump  to   about   18%per  year.Some   studies   indicate   that   horticulture   crops—generally,everything   besides   staples—may be impacted most  severely,largely because they tend to be  confined to  a  smaller  geographic  area. Researcher  Andrew  Jarvis  and  his  colleagues  found  that  80%of  coffee-growing  zones  in  Central America  and  Brazil  could  become  unsuitable  by  2050,for  example,while  climate  change  will likely  have“great  impacts”on  cocoa(可可粉)production  in  West  Africa.“High  quality  chocolate will  be  less   available  in  the   future,and  if  you  want   it,you'll  have  to  pay   a  lot  more   for  it," Jarvis  says. H.This  means  that,for  those  who  can  afford  it,some  foods  will  simply  cost  them  more  in  the future.But  for  poorer people,those  same  price jumps  will  likely  cause  certain  foods  to  go  extinct from  their  diets.“The  more  you  reduce,the   shorter  the   supply,and  the  higher  the  price  will jump,"Schlenker      says. I.Another  potential   climate   change-induced   problem   is   our   dependence   on   commodity   crops—  wheat,soybeans,corn   and    rice—which   currently    provide   humanity    with   75%of   its    calories, either directly  or indirectly through the  animals we raise  on those  crops.Jarvis  and his  colleagues also  found  that,over  the  past   five  decades,the  world  has   seen  an  increasing   standardisation  of diets;the  foods  we  eat  globally  today  are  36%more   similar  than  they  were  in   1961.While  this can be good news for the world’s poorest people who now consume more calories,protein and fat than   in   the   past,homogeneity(同 一 性)and  over-dependence  on  a  handful  of  staples  leaves  us vulnerable  to  threats  such  as  drought,disease  and  pests—all  of which  are  predicted  to  worsen  in many parts of the world as a result of climate change. J.There   are   ways   we   could    soften   the   coming   blow   to   the   global   food    supply,however.Like Farrant's   work   with   resurrection   crops,a   number   of   companies,organisations   and   researchers are   aiming   to   create   drought-and-temperature-resistant   crops   through   genetic   engineering   and conventional  breeding.For  now,the  jury  is   still  out  as  to  how  successful  those  endeavours  will be.“The people  at  Monsanto  who  I've  talked  to  are  much  more  optimistic  that  they'll  be  able  to engineer  heat-tolerant   crops,”Schlenker   says.“On  the   other  hand,scientists   at   the  USDA  who I've  spoken  with  are  much  more  cautious.” K.Until   genetic   engineering   comes   to   fruition,other   strategies   might   also   help   in   some   places, including   applying   more    fertiliser,implementing    better    irrigation,using   machinery    that    gets crops  out  of  the  field  faster  or  installing  storage  facilities  to  delay  spoilage.“Many  places  could benefit  a  great  deal  just   by  using  technologies  that  already  exist,”Walsh  says.“General  farm management  can  go  a  long way  toward  easing  changes." L.Finally,diversifying   our   diet    away   from   heat-sensitive   wheat,corn,rice    and   other   crops    could also help.“We've  seen profound changes in the last decades in what we eat largely as a result of international   trade,and   I    think   that    trend   toward   more    diversification   will    continue,”Jarvis says."Depending  on  a  greater  number  of  plant   species  creates  a  more  vigorous  and  less  risky food  system—and  one  that  provides  a  broader  range  of  nutritional  requirements.” `,
      sentences: [
        {
          text: "36.One consequence of climate change is that some people may not have adequate access to certain foods.",
          answer: "D",
        },
        {
          text: "37.People  around  the  world  are  eating  foods  more  similar  than  what  they  used  to  eat.",
          answer: "I",
        },
        {
          text: "38.A  recent  news  report  talked   about   scientific   efforts   to  help   crops   survive   droughts   through genetic  engineering.",
          answer: "B",
        },
        {
          text: "39.It  is  predicted  that  climate  change  will  affect  the  availability  and  price  of  quality  chocolate.",
          answer: "G",
        },
        {
          text: "40.People  wonder  if  certain  crops  and  foodstuffs  could  disappear  like  some  animal  species  due  to climate   change.",
          answer: "A",
        },
        {
          text: "41.Although  farms  in  the  U.S.can  move   a  bit  northward,crop  yields  may   decrease.",
          answer: "F",
        },
        {
          text: "42.One  possible  solution  to  the  food  security  problem  is  diversification  of  diet.",
          answer: "L",
        },
        {
          text: "43.It  remains  unsettled  whether  the  global  food  supply  problem   can  be   solved  by   creating   heat- tolerant  crops  through   genetic  engineering.",
          answer: "J",
        },
        {
          text: "44.Poor people may have to give up eating certain  foods because of their high prices.",
          answer: "H",
        },
        {
          text: "45.A number of existing  farming technologies could be used to reduce the negative  effect of climate change  on  food  production.",
          answer: "K",
        },
      ],
    },
    readingComprehension: [
      {
        id: 27,
        type: "readingComprehension",
        article:
          "One  of  my   bad  habits   is   saying“busy”when  people  ask  me  how  I’m  doing.Sometimes  it's because  I  actually  am  busy,but  other  times   it's  because  that's  what   I  think  I’m   supposed  to   say. That's  what   important   people   say.That's   what   people   who   get   promoted   say.But   working   long hours  doesn't  drive  better  results.Never  taking  a  vacation  won't  lead  to  a  promotion.So  why  are  we so proud to talk about how busy we are all the time?In  2016,researchers   from   Columbia,Harvard,and   Georgetown   conducted   a   study   to   figure   it out.They   found   busy   people    are   perceived   to   be    of   high   status,and    interestingly,these   status attributions   are  heavily   influenced  by   our   own   beliefs   about   social   mobility.In   other   words,the more  we  believe  that  one  has  the  opportunity  for  success  based  on  hard  work,the  more  we  tend  to think that people who  skip  leisure  and work  all the time  are  of higher  standing.That's why we  feel  like we have to  appear busy,and there's  a real perception that if someone  is knee-deep  in  meetings,emails  and  stress,then  they're  probably   a  big   deal.This  culture  of  busyness is  making  it  hard  for  employees  to  find  work-life  balance.According  to  a  recent  study,one  in  five highly engaged employees are at risk of burnout(精疲力竭).Personally,I'm   going   to   stop    saying“busy”when   people   ask   me   how   I   am.It   sounds    self- righteous (自以为是的)and  sets  the  wrong  tone.Phrases  like“I  have  limited  access  to  email”and I'll  respond  as  soon  as  I  get  back”sound  like  you're  being  held  against  your  will  from  working  as opposed to making the most of your time off.That's  why  we  recently  launched  the  Out  of  Office  Email  Generator,a  free  tool  you  can  use before  your  next  long  weekend  or  trip.You  can  share  loud  and  proud  that  you  won't  be  checking email  until  you're  back.Managers  need  to  think  twice  about  emailing  their  teams  on  the  weekend and   talking   about   how   busy   they   are.Leaders   should   take   time   off   themselves   and   encourage employees to  do the  same.",
        questions: [
          {
            question:
              "46.What  is  a  reason  for  the  author  to  be  in  the  habit  of  saying“busy”when  asked  how  he  is  doing?",
            options: [
              "A. He  just  follows   successful  people's  example.",
              "B. He  is  actually  proud  to  be  fully  occupied.",
              "C. He  thinks  everyone  should  be  devoted  to  work.",
              "D. He  believes  busyness   ensures   accomplishments.",
            ],
            answer: "A",
          },
          {
            question:
              "47.Why  do  we  tend  to  think  that busy people  are  of high  status?",
            options: [
              "A. Our  status  can  be  attributed  to  our  social  mobility.",
              "B. We  hold  the  belief that  hard  work  leads  to  success.",
              "C. Our  own  opportunity  for  success  never  comes  easily.",
              "D. We  find  few  people  of high  status  have  time  for  leisure.",
            ],
            answer: "B",
          },
          {
            question:
              "48.What  do  we  learn  about  the  culture  of busyness  from  a  recent  study?",
            options: [
              "A. It  places  employees  in  endless  meetings,emails  and  stress.",
              "B. It  compels   some  20%of  employees  to  appear  always  busy.",
              "C. It  distorts  many  employees'belief  of  what  a   satisfying  life  is.",
              "D. It  does  much  harm  to  many  busy   employees'well-being.",
            ],
            answer: "D",
          },
          {
            question:
              "49.What  do  such  utterances  as  “I  have  limited  access  to  email”sound  like  according  to  the  author?",
            options: [
              "A. One  is  too busy  to  check  all  emails  in  time.",
              "B. One  is  opposed  to  the  prevailing  work  culture.",
              "C. One  is  forced  by  circumstances  to  stop  working.",
              "D. One  is  simply  enjoying  their  time  off  work.",
            ],
            answer: "C",
          },
          {
            question:
              "50.Why  did  the  author  and  his  colleagues  launch  the  Out  of  Office  Email  Generator?",
            options: [
              "A. To  enable  busy  employees  to  spend  less  time  checking  emails.",
              "B. To  ensure  employees  as  well  as  employers  truly  have  time  off.",
              "C. To  stop  managers  from  talking  about  how  busy  their  teams  usually  are.",
              "D. To  encourage  both  employers  and  employees  to  answer  emails  promptly. ",
            ],
            answer: "B",
          },
        ],
      },
      {
        id: 28,
        type: "readingComprehension",
        article:
          "Female employees consistently pay lower airfares than men do for the same flights because they tend to book  earlier.We compared the airfare paid by employees in the same position within a company for the same class  of travel  and used  a  common  statistical technique to  account  for  other  factors  that might  affect differences  in   airfares.We  found  that  women  paid   on  average  $18  less  per  ticket  than  their  male colleagues.Further  investigation  allowed  us  to  conclude  that  this  gap  is  largely  explained  by  the  fact that  women  tended  to  book  earlier  than  men,1.8  days  on  average.We wanted to determine what was causing these gender differences in booking business trips  so we tested a variety of possible  explanations,such  as women  choosing to plan  ahead  or male  frequent travelers  being  inclined  to  book  late.None  of  these  explained  away  the  gender  gap,so  we  applied data  collected  from  surveys  that  express  consumer  preferences  that  play  a  central  role  in  economic decisions,such  as  patience  and  risk  avoidance.We  found  that  only  the  concept  of“negative  reciprocity”—in  which  an  employee  who  feels unfairly   treated   engages    in   negative    behaviors,such   as    spending   their    company's   money    less carefully—explains   these   differences.The    surveys   showed   men    tend   to   exhibit   more    of   these negative  behaviors  than  women.This  isn’t  to   say  that   all  men   engage  in  these  behaviors—or  that booking  relatively  late  is  a  sign  of  abnormal  behavior.It  only  means  that  the  gender  gap  disappearswhen we plug in the negative reciprocity variable.Prior research on negative reciprocity among workers found that it can result in lower employee motivation,business   performance   and   workplace   morale(士气)and   culture.Our  results  show  another  way  these  negative  behaviors  can  manifest  themselves,like  in  airline bookings,and  add  to  evidence  that  women  are  less  likely  to  engage  in  them.Companies  spend  significant  sums  of  money  on  business  travel.While  that  $18  difference  per  ticket  may  seem  small,it  adds  up.Our  analysis  suggests  early  booking  by  women  can  translate  into savings  of  $1million  a  year  for  a  large  multinational  company  with  20,000  regular  travelers.",
        questions: [
          {
            question:
              "51.What  did  the  author's  team  conclude  about  the  gender  difference  in  airfares  from  their  furtherr investigation?",
            options: [
              "A. It  is  largely  attributed  to  women  booking  earlier  than  men.",
              "B. It  is  largely  explained  by  women's  choosing  cheaper  flights.",
              "C. It  is  mainly  accounted  for  by  male  employees'readiness  to  pay  more.",
              "D. It  is  due  to  the  fact  that  women  care  more  about  their  company's  money.",
            ],
            answer: "A",
          },
          {
            question:
              "52.What  did  the  researchers  want  to  determine  by  testing  a  variety  of  possible  explanations?",
            options: [
              "A. What  made  male  frequent  travelers  book  air  tickets  late.",
              "B. What  caused  women  to  plan  ahead  in  booking  business  trips.",
              "C. What  motivated  women  to  book  cheaper   flights.",
              "D. What  accounted  for  the  gender  gap  in  airfares.",
            ],
            answer: "D",
          },
          {
            question:
              "53.What  happened  when  the  negative  reciprocity  variable  was  taken  into  account?",
            options: [
              "A. Both  men  and  women  were  found  to  engage  in  negative  behaviors.",
              "B. Neither men nor women viewed booking  late  as  a  bad  behavior.",
              "C. The  gender  difference  in  airfare  expenses  no  longer  existed.",
              "D. The  gender  gap  tended  to  narrow  to  a  significant  degree.",
            ],
            answer: "C",
          },
          {
            question:
              "54.What  did  prior  research  on  negative  reciprocity  among  workers  find?",
            options: [
              "A. It  can  do  more  harm  to  the  workplace  than  to  employees.",
              "B. It  contributes  to  the  male-female  divide  in  the  workplace.",
              "C. It  proves  to  be  counterproductive  in  a  number  of  ways.",
              "D. It  can  result   in  increasing  labor-management  conflicts.",
            ],
            answer: "C",
          },
          {
            question:
              "55.What  does  the  author  emphasize  about  their  analysis  in  the  last  paragraph?",
            options: [
              "A. It  can  help  companies  increase  their  savings  significantly.",
              "B. It  can  duly  contribute  to  companies'business  performance.",
              "C. It  can  translate  women's  booking  practice   into  men's  behavior.",
              "D. It   can   enhance   large   multinational   companies'competitiveness.",
            ],
            answer: "A",
          },
        ],
      },
    ],
    translation: {
      id: 29,
      type: "translation",
      chinese:
        "中国政府十分重视人民的健康饮食 (diet)。通过大力提倡健康饮食，人们对合理营养增进健康 的重要性有了更加深刻的认识。“吃得安全、吃得营养、吃得健康”是人民对美好生活的基本需要，是 提升人民幸福感的必然要求，也为食品产业的发展提供了新机遇。目前，各级政府都在采取多种举措 确保人民饮食健康，推进健康中国的建设。",
      reference:
        "Scientific and technological innovation is an important force driving social progress. In today's world, technological development is advancing rapidly, and new technologies such as artificial intelligence, big data, and cloud computing are profoundly changing people's production and lifestyle. The application of these technologies not only improves production efficiency but also provides new ideas and methods for solving global challenges. However, technological development has also brought new problems and challenges, such as the digital divide, privacy protection, and changes in employment structure. Therefore, while promoting scientific and technological innovation, we must pay attention to scientific and technological ethics to ensure that technological development benefits humanity and promotes social fairness and justice.",
    },
    writing: {
      id: 30,
      type: "writing",
      topic:
        "Suppose   the   university   newspaper   is   inviting   submissions  from   the   students  for   its coming  edition  on  a  campus  event  that  has  impressed  them  most.You  are  now  to  write  an  essay for  submission.You  will  have  30  minutes  to  write  the  essay.You  should  write  at  least 120 words but no more than 180  words.",
      tips: "作文",
    },
  },
};

module.exports = questionBank;
