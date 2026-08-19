(function () {
  const d = window.SEED_DATA;
  const add = (key, value) => { if (!d[key]) d[key] = value; };
  add("papers", [{id:"paper1",facultyId:"f7",title:"Multimodal affective computing reading thread",authors:"Morency lab",venue:"Research thread",year:2025,url:"",topic:"multimodal affective computing",projectId:"p1",importance:"must_read",readingStatus:"reading",whyRelevant:"Direct bridge to multimodal social and emotion reasoning.",potentialGap:"No explicit branching longitudinal emotional histories.",notes:"Replace with verified paper records during faculty review."}]);
  add("publications", [{id:"pub1",title:"EmoTree-Bench",venue:"TBD",year:2027,status:"working",authorOrder:1,coauthors:"TBD",advisor:"TBD",submissionDeadline:"2027-05-15",reviewDate:"",cameraReady:"",projectId:"p1"},{id:"pub2",title:"LIMO4SI",venue:"TBD",year:2027,status:"working",authorOrder:1,coauthors:"TBD",advisor:"TBD",submissionDeadline:"2027-06-01",reviewDate:"",cameraReady:"",projectId:"p2"}]);
  add("sopDocuments", [{id:"sop1",school:"Master",facultyMentions:"",researchFit:"Multimodal and embodied reasoning",projectsUsed:"EmoTree-Bench, LIMO4SI",wordLimit:1200,version:"v0.1",status:"outline",opening:"",research1:"",research2:"",futureResearch:"",whyProgram:"",facultyFit:"",careerGoal:""}]);
  add("recommenders", []); add("recommendations", []); add("contactRecords", []);
  add("tests", [{id:"test1",type:"TOEFL",testDate:"",registrationDeadline:"",reading:"",listening:"",speaking:"",writing:"",total:"",targetScore:105,notes:"Track speaking subscores."},{id:"test2",type:"GRE",testDate:"",registrationDeadline:"",verbal:"",quantitative:"",writing:"",total:"",targetScore:"",notes:"Prioritize only where accepted or recommended."}]);
  add("cvItems", [{id:"cv1",section:"Education",title:"B.S. Computer Science",organization:"Tsinghua University",startDate:"",endDate:"2028-06",description:"GPA 3.3; add coursework and context.",includeAcademic:true,includeApplication:true},{id:"cv2",section:"Research Experience",title:"EmoTree-Bench",organization:"Tsinghua University",startDate:"",endDate:"Present",description:"Longitudinal multimodal emotion reasoning benchmark.",includeAcademic:true,includeApplication:true}]);
  add("interviews", []); add("offers", []);
  add("costs", [{id:"cost1",applicationId:"",category:"Application fees",estimated:2500,actual:0,currency:"USD",notes:"Update after final school list."},{id:"cost2",applicationId:"",category:"Score reports",estimated:500,actual:0,currency:"USD",notes:"TOEFL/GRE reports."}]);
  add("labMembers", []); add("communityClaims", []); add("facultyTimeline", []); add("notes", d.notes || []);
  add("tags", [{id:"tag1",name:"important",color:"green"},{id:"tag2",name:"follow_up",color:"amber"},{id:"tag3",name:"question",color:"blue"},{id:"tag4",name:"risk",color:"red"},{id:"tag5",name:"strong_fit",color:"green"}]);
  add("deadlines", []); add("aiTraces", []);
})();
