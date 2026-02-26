#!/usr/bin/env python3
"""
KODEX Backend API Test Suite
Tests all API endpoints for the EU AI Act compliance tool
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class KODEXAPITester:
    def __init__(self, base_url: str = "https://act-navigator.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.project_id = None
        self.assessment_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, headers: Optional[Dict] = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        
        # Default headers
        req_headers = {'Content-Type': 'application/json'}
        if self.token:
            req_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            req_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=req_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=req_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            details = f"Status: {response.status_code} (expected {expected_status})"
            if not success:
                details += f" | Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            return success, response_data

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        
        # Root endpoint
        self.run_test("API Root", "GET", "", 200)
        
        # Health check
        self.run_test("Health Check", "GET", "health", 200)

    def test_questions_endpoint(self):
        """Test questions endpoint (public)"""
        print("\n🔍 Testing Questions Endpoint...")
        
        success, data = self.run_test("Get Questions", "GET", "questions", 200)
        
        if success and data:
            if 'questions' in data and 'version' in data:
                self.log_test("Questions Structure Valid", True, f"Found {len(data['questions'])} questions, version {data['version']}")
                
                # Check if we have the expected questions
                question_ids = [q.get('id') for q in data['questions']]
                expected_questions = ['q1_company_role', 'q2_deployment', 'q3_domain', 'q4_decision_impact']
                
                has_expected = all(qid in question_ids for qid in expected_questions)
                self.log_test("Expected Questions Present", has_expected, f"Found: {question_ids[:5]}...")
            else:
                self.log_test("Questions Structure Valid", False, "Missing 'questions' or 'version' field")

    def test_classification_endpoint(self):
        """Test classification endpoint (public)"""
        print("\n🔍 Testing Classification Endpoint...")
        
        # Test with sample answers
        sample_answers = {
            "q1_company_role": "developer",
            "q2_deployment": "external",
            "q3_domain": "hiring_hr",
            "q4_decision_impact": "significant_impact",
            "q5_data_types": "personal_nonsensitive",
            "q6_biometric": "no",
            "q7_safety_critical": "no",
            "q8_human_oversight": "human_reviews",
            "q9_behavior": "scores_ranks",
            "q10_logging": "partial_logging"
        }
        
        success, data = self.run_test("Classify Assessment", "POST", "classify", 200, {"answers_json": sample_answers})
        
        if success and data:
            required_fields = ['bucket', 'confidence', 'decisive_factors', 'plain_language_summary']
            has_all_fields = all(field in data for field in required_fields)
            self.log_test("Classification Response Valid", has_all_fields, f"Bucket: {data.get('bucket')}, Confidence: {data.get('confidence')}")

    def test_auth_flow(self):
        """Test authentication flow"""
        print("\n🔍 Testing Authentication Flow...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        test_email = f"test_user_{timestamp}@kodex-test.com"
        test_password = "TestPassword123!"
        
        # Test registration
        register_data = {
            "email": test_email,
            "password": test_password
        }
        
        success, data = self.run_test("User Registration", "POST", "auth/register", 200, register_data)
        
        if success and data:
            if 'token' in data and 'user' in data:
                self.token = data['token']
                self.user_id = data['user']['id']
                self.log_test("Registration Token Valid", True, f"User ID: {self.user_id}")
            else:
                self.log_test("Registration Token Valid", False, "Missing token or user in response")
                return False
        else:
            return False
        
        # Test login with same credentials
        login_data = {
            "email": test_email,
            "password": test_password
        }
        
        success, data = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        
        if success and data:
            if 'token' in data:
                # Update token with login token
                self.token = data['token']
                self.log_test("Login Token Valid", True)
            else:
                self.log_test("Login Token Valid", False, "Missing token in login response")
        
        # Test /me endpoint
        self.run_test("Get Current User", "GET", "auth/me", 200)
        
        return True

    def test_projects_crud(self):
        """Test projects CRUD operations"""
        print("\n🔍 Testing Projects CRUD...")
        
        if not self.token:
            self.log_test("Projects CRUD", False, "No authentication token available")
            return False
        
        # Create project
        project_data = {
            "name": "Test AI System",
            "org_name": "Test Organization"
        }
        
        success, data = self.run_test("Create Project", "POST", "projects", 200, project_data)
        
        if success and data:
            self.project_id = data.get('id')
            if self.project_id:
                self.log_test("Project Creation Valid", True, f"Project ID: {self.project_id}")
            else:
                self.log_test("Project Creation Valid", False, "Missing project ID in response")
                return False
        else:
            return False
        
        # List projects
        self.run_test("List Projects", "GET", "projects", 200)
        
        # Get specific project
        self.run_test("Get Project", "GET", f"projects/{self.project_id}", 200)
        
        # Update project
        update_data = {"name": "Updated Test AI System"}
        self.run_test("Update Project", "PUT", f"projects/{self.project_id}", 200, update_data)
        
        return True

    def test_assessments_crud(self):
        """Test assessments CRUD operations"""
        print("\n🔍 Testing Assessments CRUD...")
        
        if not self.token or not self.project_id:
            self.log_test("Assessments CRUD", False, "Missing authentication or project")
            return False
        
        # Sample assessment data
        assessment_data = {
            "project_id": self.project_id,
            "answers_json": {
                "q1_company_role": "developer",
                "q2_deployment": "external",
                "q3_domain": "hiring_hr",
                "q4_decision_impact": "significant_impact",
                "q5_data_types": "personal_nonsensitive",
                "q6_biometric": "no",
                "q7_safety_critical": "no",
                "q8_human_oversight": "human_reviews",
                "q9_behavior": "scores_ranks",
                "q10_logging": "partial_logging"
            }
        }
        
        success, data = self.run_test("Create Assessment", "POST", "assessments", 200, assessment_data)
        
        if success and data:
            self.assessment_id = data.get('id')
            if self.assessment_id:
                self.log_test("Assessment Creation Valid", True, f"Assessment ID: {self.assessment_id}")
                
                # Check if classification was generated
                if data.get('classification_json'):
                    bucket = data['classification_json'].get('bucket')
                    self.log_test("Assessment Classification Generated", True, f"Bucket: {bucket}")
                else:
                    self.log_test("Assessment Classification Generated", False, "No classification in response")
                
                # Check if roadmap was generated
                if data.get('roadmap_json'):
                    roadmap_count = len(data['roadmap_json'])
                    self.log_test("Assessment Roadmap Generated", True, f"Tasks: {roadmap_count}")
                else:
                    self.log_test("Assessment Roadmap Generated", False, "No roadmap in response")
            else:
                self.log_test("Assessment Creation Valid", False, "Missing assessment ID")
                return False
        else:
            return False
        
        # Get assessment
        self.run_test("Get Assessment", "GET", f"assessments/{self.assessment_id}", 200)
        
        # List project assessments
        self.run_test("List Project Assessments", "GET", f"projects/{self.project_id}/assessments", 200)
        
        return True

    def test_settings_crud(self):
        """Test settings CRUD operations"""
        print("\n🔍 Testing Settings CRUD...")
        
        if not self.token:
            self.log_test("Settings CRUD", False, "No authentication token available")
            return False
        
        # Get settings (should create default if not exists)
        success, data = self.run_test("Get Settings", "GET", "settings", 200)
        
        if success and data:
            required_fields = ['currency', 'penalty_tier_model', 'tier_parameters']
            has_required = all(field in data for field in required_fields)
            self.log_test("Settings Structure Valid", has_required, f"Currency: {data.get('currency')}")
        
        # Update settings
        update_data = {
            "currency": "USD",
            "default_turnover": 1000000,
            "disclaimer_text": "Test disclaimer text"
        }
        
        self.run_test("Update Settings", "PUT", "settings", 200, update_data)

    def test_estimator_endpoint(self):
        """Test fine exposure estimator"""
        print("\n🔍 Testing Fine Exposure Estimator...")
        
        estimator_data = {
            "classification_bucket": "High-risk",
            "turnover": 5000000,
            "currency": "EUR",
            "tier_parameters": {
                "A": {"min_percent": 0.5, "max_percent": 3},
                "B": {"min_percent": 1.5, "max_percent": 7},
                "C": {"min_percent": 2, "max_percent": 6, "fixed_max": 35000000}
            }
        }
        
        success, data = self.run_test("Calculate Fine Exposure", "POST", "estimate", 200, estimator_data)
        
        if success and data:
            required_fields = ['min', 'max', 'currency', 'tier']
            has_required = all(field in data for field in required_fields)
            self.log_test("Estimator Response Valid", has_required, f"Range: {data.get('min')} - {data.get('max')} {data.get('currency')}")

    def test_export_endpoint(self):
        """Test export endpoint"""
        print("\n🔍 Testing Export Endpoint...")
        
        if not self.token or not self.assessment_id:
            self.log_test("Export Endpoint", False, "Missing authentication or assessment")
            return False
        
        success, data = self.run_test("Export Assessment", "GET", f"export/{self.assessment_id}", 200)
        
        if success and data:
            required_fields = ['project', 'assessment', 'disclaimer']
            has_required = all(field in data for field in required_fields)
            self.log_test("Export Response Valid", has_required, "Export data structure correct")

    def cleanup_test_data(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        
        if self.token and self.project_id:
            # Delete project (this should cascade delete assessments)
            self.run_test("Delete Test Project", "DELETE", f"projects/{self.project_id}", 200)

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting KODEX Backend API Test Suite")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        try:
            # Test public endpoints first
            self.test_health_endpoints()
            self.test_questions_endpoint()
            self.test_classification_endpoint()
            
            # Test authentication
            if self.test_auth_flow():
                # Test authenticated endpoints
                self.test_settings_crud()
                self.test_projects_crud()
                self.test_assessments_crud()
                self.test_estimator_endpoint()
                self.test_export_endpoint()
                
                # Cleanup
                self.cleanup_test_data()
            
        except KeyboardInterrupt:
            print("\n⚠️ Tests interrupted by user")
        except Exception as e:
            print(f"\n💥 Unexpected error: {str(e)}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed / self.tests_run * 100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Show failed tests
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = KODEXAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())