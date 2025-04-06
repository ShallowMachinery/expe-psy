const Courses = [
    {
        college: "College of Architecture and Fine Arts",
        courses: [
            { name: "Bachelor of Fine Arts", code: "FineArts" },
            { name: "Bachelor of Fine Arts - Major in Visual Communication", code: "FineArtsMVC" },
            { name: "Bachelor of Landscape Architecture", code: "LandscapeArchitecture" },
            { name: "Bachelor of Science in Architecture", code: "Architecture" }
        ]
    },
    {
        college: "College of Arts and Letters",
        courses: [
            { name: "Bachelor of Arts in Broadcasting", code: "Broadcasting" },
            { name: "Bachelor of Arts in Journalism", code: "Journalism" },
            { name: "Bachelor of Arts in Malikhaing Pagsulat", code: "MalikhaingPagsulat" },
            { name: "Bachelor of Arts in Mass Communication", code: "MassCommunication" },
            { name: "Bachelor of Arts in Theater Arts", code: "TheaterArts" },
            { name: "Bachelor of Performing Arts - Theater Track", code: "PerformingArtsTT" },
            { name: "Batsilyer ng Sining sa Literatura: Malikhaing Pagsulat", code: "LiteraturaMP" }
        ]
    },
    {
        college: "College of Business Education and Accountancy",
        courses: [
            { name: "Bachelor of Science in Accountancy", code: "Accountancy" },
            { name: "Bachelor of Science in Accounting Information System", code: "AccountingInformationSystem" },
            { name: "Bachelor of Science in Accounting Technology", code: "AccountingTechnology" },
            { name: "Bachelor of Science in Business Administration", code: "BusinessAdministration" },
            { name: "Bachelor of Science in Business Administration - Major in Business Economics", code: "BusinessAdministrationMBE" },
            { name: "Bachelor of Science in Business Administration - Major in Financial Management", code: "BusinessAdministrationMFM" },
            { name: "Bachelor of Science in Business Administration - Major in Marketing Management", code: "BusinessAdministrationMMM" },
            { name: "Bachelor of Science in Entrepreneurship", code: "Entrepreneurship" },
            { name: "Bachelor of Science in Management Economics", code: "ManagementEconomics" }
        ]
    },
    {
        college: "College of Criminal Justice Education",
        courses: [
            { name: "Bachelor of Arts in Legal Management", code: "ALegalManagement" },
            { name: "Bachelor of Science in Criminology", code: "Criminology" },
            { name: "Bachelor of Science in Legal Management", code: "SLegalManagement" }
        ]
    },
    {
        "college": "College of Education",
        "courses": [
            { "name": "Bachelor of Early Childhood Education", "code": "EarlyChildhoodEducation" },
            { "name": "Bachelor of Elementary Education", "code": "ElementaryEducation" },
            { "name": "Bachelor of Elementary Education - Major in General Education", "code": "ElementaryEducationGE" },
            { "name": "Bachelor of Elementary Education - Major in Pre-school Education", "code": "ElementaryEducationPE" },
            { "name": "Bachelor of Physical Education", "code": "PhysicalEducation" },
            { "name": "Bachelor of Science in Education", "code": "Education" },
            { "name": "Bachelor of Science in Home Economics", "code": "HomeEconomics" },
            { "name": "Bachelor of Science in Home Economics - Major in Food Production Entrepreneurship", "code": "HomeEconomicsFPE" },
            { "name": "Bachelor of Secondary Education", "code": "SecondaryEducation" },
            { "name": "Bachelor of Secondary Education - Major in Biological Science", "code": "SecondaryEducationBS" },
            { "name": "Bachelor of Secondary Education - Major in English", "code": "SecondaryEducationE" },
            { "name": "Bachelor of Secondary Education - Major in English, minor in Mandarin", "code": "SecondaryEducationEM" },
            { "name": "Bachelor of Secondary Education - Major in Filipino", "code": "SecondaryEducationF" },
            { "name": "Bachelor of Secondary Education - Major in Music, Arts, Physical Education, and Health", "code": "SecondaryEducationMAPEH" },
            { "name": "Bachelor of Secondary Education - Major in Mathematics", "code": "SecondaryEducationM" },
            { "name": "Bachelor of Secondary Education - Major in Physical Science", "code": "SecondaryEducationPS" },
            { "name": "Bachelor of Secondary Education - Major in Sciences", "code": "SecondaryEducationS" },
            { "name": "Bachelor of Secondary Education - Major in Social Studies", "code": "SecondaryEducationSS" },
            { "name": "Bachelor of Secondary Education - Major in Technology and Livelihood Education", "code": "SecondaryEducationTLE" },
            { "name": "Bachelor of Secondary Education - Major in Values Education", "code": "SecondaryEducationVE" },
            { "name": "Bachelor of Technical Teacher Education", "code": "TechnicalTeacherEducation" },
            { "name": "Bachelor of Technical Teacher Education - Major in Drafting Technology", "code": "TechnicalTeacherEducationDT" },
            { "name": "Bachelor of Technical Teacher Education - Major in Food Service Management", "code": "TechnicalTeacherEducationFSM" },
            { "name": "Bachelor of Technical Teacher Education - Major in Garments Fashion Design", "code": "TechnicalTeacherEducationGFD" },
            { "name": "Bachelor of Technical-Vocational Teacher Education", "code": "TechnicalVocationalTeacherEducation" },
            { "name": "Bachelor of Technology and Livelihood Education - Major in Home Economics", "code": "TechnologyLivelihoodEducationHE" },
            { "name": "Bachelor of Technology and Livelihood Education - Major in Industrial Arts", "code": "TechnologyLivelihoodEducationIA" },
            { "name": "Bachelor of Technology and Livelihood Education - Major in Information and Communication Technology", "code": "TechnologyLivelihoodEducationICT" }
        ]
    },
    {
        "college": "College of Engineering",
        "courses": [
            { "name": "Bachelor of Science in Civil Engineering", "code": "CivilEngineering" },
            { "name": "Bachelor of Science in Computer Engineering", "code": "ComputerEngineering" },
            { "name": "Bachelor of Science in Electrical Engineering", "code": "ElectricalEngineering" },
            { "name": "Bachelor of Science in Electronics Engineering", "code": "ElectronicsEngineering" },
            { "name": "Bachelor of Science in General Engineering", "code": "GeneralEngineering" },
            { "name": "Bachelor of Science in Industrial Engineering", "code": "IndustrialEngineering" },
            { "name": "Bachelor of Science in Manufacturing Engineering", "code": "ManufacturingEngineering" },
            { "name": "Bachelor of Science in Mechanical Engineering", "code": "MechanicalEngineering" },
            { "name": "Bachelor of Science in Mechatronics Engineering", "code": "MechatronicsEngineering" }
        ]
    },
    {
        "college": "College of Hospitality and Tourism Management",
        "courses": [
            { "name": "Bachelor of Science in Food Production and Entrepreneurship", "code": "FoodProductionEntrepreneurship" },
            { "name": "Bachelor of Science in Food Science", "code": "FoodScience" },
            { "name": "Bachelor of Science in Hospitality Management", "code": "HospitalityManagement" },
            { "name": "Bachelor of Science in Tourism Management", "code": "TourismManagement" }
        ]
    },
    {
        "college": "College of Information and Communications Technology", 
        "courses": [
            { "name": "Bachelor of Library and Information Science", "code": "LibraryInformationScience" },
            { "name": "Bachelor of Science in Information System", "code": "InformationSystem" },
            { "name": "Bachelor of Science in Information Technology", "code": "InformationTechnology" }
        ]
    },
    {
        "college": "College of Industrial Technology",
        "courses": [
            { "name": "Bachelor of Industrial Technology - Major in Automotive", "code": "IndustrialTechnologyA" },
            { "name": "Bachelor of Industrial Technology - Major in Computer Technology", "code": "IndustrialTechnologyCT" },
            { "name": "Bachelor of Industrial Technology - Major in Drafting Technology", "code": "IndustrialTechnologyDT" },
            { "name": "Bachelor of Industrial Technology - Major in Electrical", "code": "IndustrialTechnologyE" },
            { "name": "Bachelor of Industrial Technology - Major in Electronics and Communication Technology", "code": "IndustrialTechnologyECT" },
            { "name": "Bachelor of Industrial Technology - Major in Electronics Technology", "code": "IndustrialTechnologyET" },
            { "name": "Bachelor of Industrial Technology - Major in Food Processing Technology", "code": "IndustrialTechnologyFPT" },
            { "name": "Bachelor of Industrial Technology - Major in Food Service Management", "code": "IndustrialTechnologyFSM" },
            { "name": "Bachelor of Industrial Technology - Major in Heating, Ventilation, Air Conditioning and Refrigeration Technology (HVACR)", "code": "IndustrialTechnologyHVACR" },
            { "name": "Bachelor of Industrial Technology - Major in Industrial Automation", "code": "IndustrialTechnologyIA" },
            { "name": "Bachelor of Industrial Technology - Major in Mechanical Technology", "code": "IndustrialTechnologyMnT" },
            { "name": "Bachelor of Industrial Technology - Major in Mechatronics Technology", "code": "IndustrialTechnologyMtT" },
            { "name": "Bachelor of Industrial Technology - Major in Welding Technology", "code": "IndustrialTechnologyWT" },
            { "name": "Bachelor of Science in Industrial Education", "code": "IndustrialEducation" },
            { "name": "Bachelor of Science in Industrial Technology", "code": "IndustrialTechnology" }
        ]
    },
    {
        "college": "College of Law",
        "courses": [
            { "name": "Bachelor of Laws", "code": "Laws" }
        ]
    },
    {
        "college": "College of Nursing",
        "courses": [
            { "name": "Bachelor of Science in Nursing", "code": "Nursing" }
        ]
    },
    {
        "college": "College of Science",
        "courses": [
            { "name": "Bachelor of Science in Biology", "code": "Biology" },
            { "name": "Bachelor of Science in Environmental Science", "code": "EnvironmentalScience" },
            { "name": "Bachelor of Science in Food Technology", "code": "FoodTechnology" },
            { "name": "Bachelor of Science in Mathematics with specialization in Applied Statistics", "code": "MathematicsAS" },
            { "name": "Bachelor of Science in Mathematics with specialization in Business Applications", "code": "MathematicsBA" },
            { "name": "Bachelor of Science in Mathematics with specialization in Computer Science", "code": "MathematicsCS" },
            { "name": "Bachelor of Science in Medical Technology (Medical Laboratory Science)", "code": "MedicalTechnology" }
        ]
    },
    {
        college: 'College of Social Sciences and Philosophy',
        courses: [
            { name: 'Bachelor of Arts in Social Science', code: 'SocialScience' },
            { name: 'Bachelor of Public Administration', code: 'PublicAdministration' },
            { name: 'Bachelor of Science in Psychology', code: 'Psychology' },
            { name: 'Bachelor of Science in Social Work', code: 'SocialWork' }
        ]
    },
    {
        college: 'College of Sports, Exercise and Recreation',
        courses: [

            { name: 'Bachelor in Physical Education - Major in School Physical Education', code: 'PhysicalEducationSPE' },
            { name: 'Bachelor in Physical Education - Major in Sports and Welness Management', code: 'PhysicalEducationSWM' },
            { name: 'Bachelor of Science in Exercise and Sports Sciences with specialization in Fitness and Sports Coaching', code: 'ExerciseSportsSciencesFSC' },
            { name: 'Bachelor of Science in Exercise and Sports Sciences with specialization in Fitness and Sports Management', code: 'ExerciseSportsSciencesFSM' },
            { name: 'Bachelor of Sports Science', code: 'SportsScience' }
        ]
    },
    {
        college: 'Sarmiento Campus',
        courses: [
            { name: 'Bachelor of Science in Data Science', code: 'DataScience' }
        ]
    }
];

export default Courses;