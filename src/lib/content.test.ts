import { assert, describe, expect, it } from 'vitest';
import { projects, featured, validateProjects, type Project } from './content';
const valid = (): Project => ({ ...projects[0], topics: [...projects[0].topics] });
describe('Git-backed content contract', () => {
	it('validates the catalogue and its three featured studies', () => {
		expect(validateProjects(projects)).toBe(projects);
		expect(featured.map((p) => p.demo)).toEqual(['island', 'routing', 'lifecycle']);
	});
	it('rejects duplicate or invalid identifiers', () => {
		expect(() => validateProjects([valid(), valid()])).toThrow('slug');
		expect(() => validateProjects([{ ...valid(), slug: 'Not a slug' }])).toThrow('slug');
	});
	it('rejects unverified external source hosts', () =>
		expect(() => validateProjects([{ ...valid(), source: 'https://example.com/claim' }])).toThrow(
			'source'
		));
	it('requires content and valid status', () => {
		expect(() => validateProjects([{ ...valid(), summary: '' }])).toThrow('Incomplete');
		expect(() => validateProjects([{ ...valid(), status: 'Stable' as Project['status'] }])).toThrow(
			'status'
		);
	});
	it('requires complete study content for every demonstration', () => {
		expect(() => validateProjects([{ ...valid(), study: undefined }])).toThrow('study');
		expect(() => validateProjects([{ ...valid(), demo: undefined }])).toThrow('study');
		const study = valid().study;
		assert(study, 'Fixture must include study content');
		expect(() => validateProjects([{ ...valid(), study: { ...study, boundary: '' } }])).toThrow(
			'Incomplete study'
		);
	});
	it('rejects dangling ecosystem references', () =>
		expect(() => validateProjects([{ ...valid(), parent: 'missing' }])).toThrow('parent'));
});
